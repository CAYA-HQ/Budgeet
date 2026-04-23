package expenses

import (
	"database/sql/driver"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestExpenseService_CreateExpense(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	service := NewExpenseService(db)
	note := "Lunch"
	now := time.Now().UTC()
	expenseDate := now.Add(-time.Hour)

	mock.ExpectQuery("INSERT INTO expenses").
		WithArgs("user-1", 25.5, "Food", note, anyTime{}).
		WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "amount", "category", "note", "date", "created_at", "updated_at"}).
			AddRow("expense-1", "user-1", 25.5, "Food", note, expenseDate, now, now))

	expense, err := service.CreateExpense("user-1", 25.5, "Food", &note, expenseDate)

	require.NoError(t, err)
	require.NotNil(t, expense)
	assert.Equal(t, "expense-1", expense.ID)
	assert.Equal(t, "Food", expense.Category)
	assert.Equal(t, note, *expense.Note)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestExpenseService_ListExpenses(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	service := NewExpenseService(db)
	from := time.Now().Add(-24 * time.Hour).UTC()
	to := time.Now().UTC()

	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM expenses WHERE user_id = \\$1 AND date >= \\$2 AND date <= \\$3 AND category = \\$4").
		WithArgs("user-1", anyTime{}, anyTime{}, "Food").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

	mock.ExpectQuery("SELECT id, user_id, amount, category, note, date, created_at, updated_at").
		WithArgs("user-1", anyTime{}, anyTime{}, "Food", 10, 0).
		WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "amount", "category", "note", "date", "created_at", "updated_at"}).
			AddRow("expense-1", "user-1", 25.5, "Food", "Lunch", to, to, to))

	expenses, total, err := service.ListExpenses("user-1", ListFilters{
		From:     &from,
		To:       &to,
		Category: "Food",
		Page:     1,
		Limit:    10,
	})

	require.NoError(t, err)
	assert.Len(t, expenses, 1)
	assert.Equal(t, 1, total)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestExpenseService_UpdateExpense(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	service := NewExpenseService(db)
	amount := 30.0
	category := "Transport"
	note := "Bus"
	date := time.Now().UTC()

	mock.ExpectQuery("UPDATE expenses SET amount = \\$1, category = \\$2, note = \\$3, date = \\$4, updated_at = NOW\\(\\) WHERE id = \\$5 AND user_id = \\$6").
		WithArgs(amount, category, note, anyTime{}, "expense-1", "user-1").
		WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "amount", "category", "note", "date", "created_at", "updated_at"}).
			AddRow("expense-1", "user-1", amount, category, note, date, date, date))

	expense, err := service.UpdateExpense("user-1", "expense-1", UpdateExpenseInput{
		Amount:   &amount,
		Category: &category,
		Note:     &note,
		Date:     &date,
	})

	require.NoError(t, err)
	assert.Equal(t, category, expense.Category)
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestExpenseService_DeleteExpense(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	service := NewExpenseService(db)

	mock.ExpectExec("DELETE FROM expenses").
		WithArgs("expense-1", "user-1").
		WillReturnResult(sqlmock.NewResult(0, 1))

	err = service.DeleteExpense("user-1", "expense-1")

	require.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

type anyTime struct{}

func (a anyTime) Match(v driver.Value) bool {
	_, ok := v.(time.Time)
	return ok
}
