package middleware

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/CAYA-HQ/Spendwise-backend/internal/auth"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

func TestAuthMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)
	jwtSecret := "test-secret"
	os.Setenv("JWT_SECRET", jwtSecret)

	router := gin.New()
	router.Use(AuthMiddleware())
	router.GET("/protected", func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.Status(http.StatusInternalServerError)
			return
		}
		c.JSON(http.StatusOK, gin.H{"userID": userID})
	})

	t.Run("success", func(t *testing.T) {
		userID := "user-123"
		claims := &auth.Claims{
			UserID: userID,
			Email:  "test@example.com",
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			},
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, _ := token.SignedString([]byte(jwtSecret))

		req, _ := http.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+tokenString)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
		var responseMap map[string]interface{}
		assert.NoError(t, json.Unmarshal(resp.Body.Bytes(), &responseMap))
		assert.Equal(t, userID, responseMap["userID"])
	})

	t.Run("unauthorized - missing header", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/protected", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusUnauthorized, resp.Code)
	})

	t.Run("unauthorized - invalid token", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer invalid-token")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusUnauthorized, resp.Code)
	})

	t.Run("unauthorized - expired token", func(t *testing.T) {
		claims := &auth.Claims{
			UserID: "user-123",
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(-time.Hour)),
			},
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, _ := token.SignedString([]byte(jwtSecret))

		req, _ := http.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer "+tokenString)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusUnauthorized, resp.Code)
	})
}
