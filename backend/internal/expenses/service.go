// Package expenses contains expense business logic and persistence.
package expenses

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/CAYA-HQ/Spendwise-backend/internal/models"
)

var (
	// ErrExpenseNotFound is returned when a user tries to access a missing expense.
	ErrExpenseNotFound = errors.New("EXPENSE_NOT_FOUND")
)

// ListFilters captures supported expense list filters and pagination.
type ListFilters struct {
	From     *time.Time
	To       *time.Time
	Category string
	Page     int
	Limit    int
}

// UpdateExpenseInput captures the optional fields allowed in PATCH requests.
type UpdateExpenseInput struct {
	Amount   *float64
	Category *string
	Note     *string
	Date     *time.Time
}

// ExpenseService coordinates expense persistence for handlers.
type ExpenseService struct {
	db *sql.DB
}

// NewExpenseService creates a new expense service.
func NewExpenseService(db *sql.DB) *ExpenseService {
	return &ExpenseService{db: db}
}

// CreateExpense persists a new expense for the given user.
func (s *ExpenseService) CreateExpense(userID string, amount float64, category string, note *string, date time.Time) (*models.Expense, error) {
	var expense models.Expense
	err := s.db.QueryRow(
		`INSERT INTO expenses (id, user_id, amount, category, note, date, created_at, updated_at)
		 VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
		 RETURNING id, user_id, amount, category, note, date, created_at, updated_at`,
		userID, amount, category, nullableNote(note), date.UTC(),
	).Scan(
		&expense.ID,
		&expense.UserID,
		&expense.Amount,
		&expense.Category,
		&expense.Note,
		&expense.Date,
		&expense.CreatedAt,
		&expense.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &expense, nil
}

// ListExpenses returns a paginated, filtered set of user expenses.
func (s *ExpenseService) ListExpenses(userID string, filters ListFilters) ([]models.Expense, int, error) {
	whereClause, args := buildWhereClause(userID, filters)

	var total int
	countQuery := "SELECT COUNT(*) FROM expenses" + whereClause
	if err := s.db.QueryRow(countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	offset := (filters.Page - 1) * filters.Limit
	args = append(args, filters.Limit, offset)
	query := `SELECT id, user_id, amount, category, note, date, created_at, updated_at
		FROM expenses` + whereClause + `
		ORDER BY date DESC, created_at DESC
		LIMIT $` + fmt.Sprint(len(args)-1) + ` OFFSET $` + fmt.Sprint(len(args))

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	expenses := make([]models.Expense, 0)
	for rows.Next() {
		var expense models.Expense
		if err := rows.Scan(
			&expense.ID,
			&expense.UserID,
			&expense.Amount,
			&expense.Category,
			&expense.Note,
			&expense.Date,
			&expense.CreatedAt,
			&expense.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		expenses = append(expenses, expense)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return expenses, total, nil
}

// UpdateExpense applies a partial update to a user-owned expense.
func (s *ExpenseService) UpdateExpense(userID, expenseID string, input UpdateExpenseInput) (*models.Expense, error) {
	assignments := make([]string, 0, 4)
	args := []any{}

	if input.Amount != nil {
		assignments = append(assignments, fmt.Sprintf("amount = $%d", len(args)+1))
		args = append(args, *input.Amount)
	}
	if input.Category != nil {
		assignments = append(assignments, fmt.Sprintf("category = $%d", len(args)+1))
		args = append(args, *input.Category)
	}
	if input.Note != nil {
		assignments = append(assignments, fmt.Sprintf("note = $%d", len(args)+1))
		args = append(args, nullableNote(input.Note))
	}
	if input.Date != nil {
		assignments = append(assignments, fmt.Sprintf("date = $%d", len(args)+1))
		args = append(args, input.Date.UTC())
	}

	assignments = append(assignments, fmt.Sprintf("updated_at = NOW()"))
	args = append(args, expenseID, userID)

	query := `UPDATE expenses SET ` + strings.Join(assignments, ", ") +
		fmt.Sprintf(` WHERE id = $%d AND user_id = $%d
		RETURNING id, user_id, amount, category, note, date, created_at, updated_at`, len(args)-1, len(args))

	var expense models.Expense
	err := s.db.QueryRow(query, args...).Scan(
		&expense.ID,
		&expense.UserID,
		&expense.Amount,
		&expense.Category,
		&expense.Note,
		&expense.Date,
		&expense.CreatedAt,
		&expense.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, ErrExpenseNotFound
	}
	if err != nil {
		return nil, err
	}

	return &expense, nil
}

// DeleteExpense removes a user-owned expense.
func (s *ExpenseService) DeleteExpense(userID, expenseID string) error {
	result, err := s.db.Exec("DELETE FROM expenses WHERE id = $1 AND user_id = $2", expenseID, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return ErrExpenseNotFound
	}

	return nil
}

func buildWhereClause(userID string, filters ListFilters) (string, []any) {
	conditions := []string{"user_id = $1"}
	args := []any{userID}

	if filters.From != nil {
		conditions = append(conditions, fmt.Sprintf("date >= $%d", len(args)+1))
		args = append(args, filters.From.UTC())
	}
	if filters.To != nil {
		conditions = append(conditions, fmt.Sprintf("date <= $%d", len(args)+1))
		args = append(args, filters.To.UTC())
	}
	if filters.Category != "" {
		conditions = append(conditions, fmt.Sprintf("category = $%d", len(args)+1))
		args = append(args, filters.Category)
	}

	return " WHERE " + strings.Join(conditions, " AND "), args
}

func nullableNote(note *string) any {
	if note == nil {
		return nil
	}

	trimmed := strings.TrimSpace(*note)
	if trimmed == "" {
		return nil
	}

	return trimmed
}
