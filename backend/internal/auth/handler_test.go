package auth

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

func TestAuthHandler_Register(t *testing.T) {
	gin.SetMode(gin.TestMode)
	os.Setenv("JWT_SECRET", "test-secret")

	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	service := NewAuthService(db)
	handler := NewAuthHandler(service)

	router := gin.New()
	router.POST("/register", handler.Register)

	t.Run("success", func(t *testing.T) {
		email := "register@example.com"
		password := "password123"

		mock.ExpectQuery("SELECT EXISTS").
			WithArgs(email).
			WillReturnRows(sqlmock.NewRows([]string{"exists"}).AddRow(false))

		now := time.Now()
		mock.ExpectQuery("INSERT INTO users").
			WithArgs(email, sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"id", "email", "created_at", "updated_at"}).
				AddRow("user-id", email, now, now))

		mock.ExpectExec("INSERT INTO refresh_tokens").
			WithArgs("user-id", sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnResult(sqlmock.NewResult(1, 1))

		body, _ := json.Marshal(AuthRequest{Email: email, Password: password})
		req, _ := http.NewRequest("POST", "/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		if resp.Code != http.StatusCreated {
			t.Logf("Response body: %s", resp.Body.String())
		}
		assert.Equal(t, http.StatusCreated, resp.Code)
		var responseMap map[string]interface{}
		json.Unmarshal(resp.Body.Bytes(), &responseMap)
		assert.Equal(t, true, responseMap["success"])
		data := responseMap["data"].(map[string]interface{})
		assert.NotEmpty(t, data["accessToken"])
		assert.NotEmpty(t, data["refreshToken"])
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("validation error - invalid email", func(t *testing.T) {
		body, _ := json.Marshal(AuthRequest{Email: "invalid-email", Password: "password123"})
		req, _ := http.NewRequest("POST", "/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusBadRequest, resp.Code)
	})

	t.Run("validation error - short password", func(t *testing.T) {
		body, _ := json.Marshal(AuthRequest{Email: "valid@email.com", Password: "short"})
		req, _ := http.NewRequest("POST", "/register", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusBadRequest, resp.Code)
	})
}

func TestAuthHandler_Login(t *testing.T) {
	gin.SetMode(gin.TestMode)
	os.Setenv("JWT_SECRET", "test-secret")

	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	service := NewAuthService(db)
	handler := NewAuthHandler(service)

	router := gin.New()
	router.POST("/login", handler.Login)

	t.Run("success", func(t *testing.T) {
		email := "login@example.com"
		password := "password123"
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), 12)
		now := time.Now()

		mock.ExpectQuery("SELECT id, email, password_hash, created_at, updated_at FROM users").
			WithArgs(email).
			WillReturnRows(sqlmock.NewRows([]string{"id", "email", "password_hash", "created_at", "updated_at"}).
				AddRow("user-id", email, string(hashedPassword), now, now))

		mock.ExpectExec("INSERT INTO refresh_tokens").
			WithArgs("user-id", sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnResult(sqlmock.NewResult(1, 1))

		body, _ := json.Marshal(AuthRequest{Email: email, Password: password})
		req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}

func TestAuthHandler_Logout(t *testing.T) {
	gin.SetMode(gin.TestMode)

	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	service := NewAuthService(db)
	handler := NewAuthHandler(service)

	router := gin.New()
	router.POST("/logout", handler.Logout)

	t.Run("success", func(t *testing.T) {
		token := "valid-token"
		mock.ExpectExec("UPDATE refresh_tokens").
			WithArgs(sqlmock.AnyArg()).
			WillReturnResult(sqlmock.NewResult(1, 1))

		req, _ := http.NewRequest("POST", "/logout", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusNoContent, resp.Code)
		assert.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("unauthorized - missing header", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/logout", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusUnauthorized, resp.Code)
	})
}
