package expenses

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestExpenseHandler_Create(t *testing.T) {
	gin.SetMode(gin.TestMode)

	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	handler := NewExpenseHandler(NewExpenseService(db))
	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("userID", "user-1")
	})
	router.POST("/expenses", handler.Create)

	note := "Lunch"
	body, err := json.Marshal(CreateExpenseRequest{
		Amount:   25.5,
		Category: "Food",
		Note:     &note,
		Date:     "2026-04-23T10:00:00Z",
	})
	require.NoError(t, err)

	now := time.Now().UTC()
	mock.ExpectQuery("INSERT INTO expenses").
		WithArgs("user-1", 25.5, "Food", note, anyTime{}).
		WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "amount", "category", "note", "date", "created_at", "updated_at"}).
			AddRow("expense-1", "user-1", 25.5, "Food", note, now, now, now))

	req, _ := http.NewRequest("POST", "/expenses", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusCreated, resp.Code)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestExpenseHandler_List(t *testing.T) {
	gin.SetMode(gin.TestMode)

	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	handler := NewExpenseHandler(NewExpenseService(db))
	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("userID", "user-1")
	})
	router.GET("/expenses", handler.List)

	now := time.Now().UTC()
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM expenses WHERE user_id = \\$1").
		WithArgs("user-1").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

	mock.ExpectQuery("SELECT id, user_id, amount, category, note, date, created_at, updated_at").
		WithArgs("user-1", defaultLimit, 0).
		WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "amount", "category", "note", "date", "created_at", "updated_at"}).
			AddRow("expense-1", "user-1", 25.5, "Food", "Lunch", now, now, now))

	req, _ := http.NewRequest("GET", "/expenses", nil)
	resp := httptest.NewRecorder()

	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestExpenseHandler_UpdateAndDelete(t *testing.T) {
	gin.SetMode(gin.TestMode)

	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	handler := NewExpenseHandler(NewExpenseService(db))
	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("userID", "user-1")
	})
	router.PATCH("/expenses/:id", handler.Update)
	router.DELETE("/expenses/:id", handler.Delete)

	t.Run("update", func(t *testing.T) {
		category := "Transport"
		body, err := json.Marshal(UpdateExpenseRequest{Category: &category})
		require.NoError(t, err)

		now := time.Now().UTC()
		mock.ExpectQuery("UPDATE expenses SET category = \\$1, updated_at = NOW\\(\\) WHERE id = \\$2 AND user_id = \\$3").
			WithArgs(category, "expense-1", "user-1").
			WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "amount", "category", "note", "date", "created_at", "updated_at"}).
				AddRow("expense-1", "user-1", 25.5, category, "Bus", now, now, now))

		req, _ := http.NewRequest("PATCH", "/expenses/expense-1", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)
	})

	t.Run("delete", func(t *testing.T) {
		mock.ExpectExec("DELETE FROM expenses").
			WithArgs("expense-1", "user-1").
			WillReturnResult(sqlmock.NewResult(0, 1))

		req, _ := http.NewRequest("DELETE", "/expenses/expense-1", nil)
		resp := httptest.NewRecorder()

		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusNoContent, resp.Code)
		assert.NoError(t, mock.ExpectationsWereMet())
	})
}
