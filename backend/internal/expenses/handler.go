// Package expenses contains expense HTTP handlers.
package expenses

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/CAYA-HQ/Spendwise-backend/pkg/response"
	"github.com/gin-gonic/gin"
)

const (
	defaultPage  = 1
	defaultLimit = 20
	maxLimit     = 100
)

// ExpenseHandler translates HTTP requests into expense service calls.
type ExpenseHandler struct {
	service *ExpenseService
}

// CreateExpenseRequest is the POST /expenses payload.
type CreateExpenseRequest struct {
	Amount   float64 `json:"amount"`
	Category string  `json:"category"`
	Note     *string `json:"note"`
	Date     string  `json:"date"`
}

// UpdateExpenseRequest is the PATCH /expenses/:id payload.
type UpdateExpenseRequest struct {
	Amount   *float64 `json:"amount"`
	Category *string  `json:"category"`
	Note     *string  `json:"note"`
	Date     *string  `json:"date"`
}

// NewExpenseHandler creates a new expense handler.
func NewExpenseHandler(service *ExpenseService) *ExpenseHandler {
	return &ExpenseHandler{service: service}
}

// Create persists a new user expense.
func (h *ExpenseHandler) Create(c *gin.Context) {
	userID := c.GetString("userID")

	var req CreateExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid request body")
		return
	}

	date, ok := h.validateCreateRequest(c, req)
	if !ok {
		return
	}

	expense, err := h.service.CreateExpense(userID, req.Amount, strings.TrimSpace(req.Category), req.Note, date)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "An unexpected error occurred")
		return
	}

	response.Success(c, http.StatusCreated, expense, nil)
}

// List returns paginated expenses for the authenticated user.
func (h *ExpenseHandler) List(c *gin.Context) {
	userID := c.GetString("userID")

	filters, ok := h.parseListFilters(c)
	if !ok {
		return
	}

	expenses, total, err := h.service.ListExpenses(userID, filters)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "An unexpected error occurred")
		return
	}

	response.Success(c, http.StatusOK, expenses, gin.H{
		"total": total,
		"page":  filters.Page,
		"limit": filters.Limit,
	})
}

// Update applies a partial update to a user-owned expense.
func (h *ExpenseHandler) Update(c *gin.Context) {
	userID := c.GetString("userID")
	expenseID := c.Param("id")
	if strings.TrimSpace(expenseID) == "" {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Expense ID is required")
		return
	}

	var req UpdateExpenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid request body")
		return
	}

	input, ok := h.validateUpdateRequest(c, req)
	if !ok {
		return
	}

	expense, err := h.service.UpdateExpense(userID, expenseID, input)
	if err != nil {
		if err == ErrExpenseNotFound {
			response.Error(c, http.StatusNotFound, "EXPENSE_NOT_FOUND", "Expense not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "An unexpected error occurred")
		return
	}

	response.Success(c, http.StatusOK, expense, nil)
}

// Delete removes a user-owned expense.
func (h *ExpenseHandler) Delete(c *gin.Context) {
	userID := c.GetString("userID")
	expenseID := c.Param("id")
	if strings.TrimSpace(expenseID) == "" {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Expense ID is required")
		return
	}

	if err := h.service.DeleteExpense(userID, expenseID); err != nil {
		if err == ErrExpenseNotFound {
			response.Error(c, http.StatusNotFound, "EXPENSE_NOT_FOUND", "Expense not found")
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "An unexpected error occurred")
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *ExpenseHandler) validateCreateRequest(c *gin.Context, req CreateExpenseRequest) (time.Time, bool) {
	if req.Amount <= 0 {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Amount must be greater than zero")
		return time.Time{}, false
	}

	if strings.TrimSpace(req.Category) == "" {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Category is required")
		return time.Time{}, false
	}

	date, err := time.Parse(time.RFC3339, req.Date)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Date must be a valid RFC3339 timestamp")
		return time.Time{}, false
	}

	return date, true
}

func (h *ExpenseHandler) parseListFilters(c *gin.Context) (ListFilters, bool) {
	page := defaultPage
	limit := defaultLimit

	if rawPage := c.Query("page"); rawPage != "" {
		parsedPage, err := strconv.Atoi(rawPage)
		if err != nil || parsedPage < 1 {
			response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "page must be a positive integer")
			return ListFilters{}, false
		}
		page = parsedPage
	}

	if rawLimit := c.Query("limit"); rawLimit != "" {
		parsedLimit, err := strconv.Atoi(rawLimit)
		if err != nil || parsedLimit < 1 || parsedLimit > maxLimit {
			response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "limit must be between 1 and 100")
			return ListFilters{}, false
		}
		limit = parsedLimit
	}

	var from *time.Time
	if rawFrom := c.Query("from"); rawFrom != "" {
		parsedFrom, err := time.Parse(time.RFC3339, rawFrom)
		if err != nil {
			response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "from must be a valid RFC3339 timestamp")
			return ListFilters{}, false
		}
		from = &parsedFrom
	}

	var to *time.Time
	if rawTo := c.Query("to"); rawTo != "" {
		parsedTo, err := time.Parse(time.RFC3339, rawTo)
		if err != nil {
			response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "to must be a valid RFC3339 timestamp")
			return ListFilters{}, false
		}
		to = &parsedTo
	}

	if from != nil && to != nil && from.After(*to) {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "from must be before or equal to to")
		return ListFilters{}, false
	}

	return ListFilters{
		From:     from,
		To:       to,
		Category: strings.TrimSpace(c.Query("category")),
		Page:     page,
		Limit:    limit,
	}, true
}

func (h *ExpenseHandler) validateUpdateRequest(c *gin.Context, req UpdateExpenseRequest) (UpdateExpenseInput, bool) {
	if req.Amount == nil && req.Category == nil && req.Note == nil && req.Date == nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "At least one field is required")
		return UpdateExpenseInput{}, false
	}

	input := UpdateExpenseInput{
		Amount:   req.Amount,
		Category: req.Category,
		Note:     req.Note,
	}

	if req.Amount != nil && *req.Amount <= 0 {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Amount must be greater than zero")
		return UpdateExpenseInput{}, false
	}

	if req.Category != nil {
		trimmed := strings.TrimSpace(*req.Category)
		if trimmed == "" {
			response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Category cannot be empty")
			return UpdateExpenseInput{}, false
		}
		input.Category = &trimmed
	}

	if req.Date != nil {
		parsedDate, err := time.Parse(time.RFC3339, *req.Date)
		if err != nil {
			response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Date must be a valid RFC3339 timestamp")
			return UpdateExpenseInput{}, false
		}
		input.Date = &parsedDate
	}

	return input, true
}
