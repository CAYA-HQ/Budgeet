// Package auth contains authentication business logic and HTTP adapters.
// It handles token creation, credential checks, and route wiring.
package auth

import (
	"net/http"
	"regexp"
	"strings"

	"github.com/CAYA-HQ/Spendwise-backend/pkg/response"
	"github.com/gin-gonic/gin"
)

// AuthHandler translates HTTP requests into auth service calls.
// It validates input and formats consistent API responses.
type AuthHandler struct {
	service *AuthService
}

// NewAuthHandler creates an HTTP handler backed by the auth service.
// The handler exposes register, login, and logout endpoints.
func NewAuthHandler(service *AuthService) *AuthHandler {
	return &AuthHandler{service: service}
}

// AuthRequest represents the JSON payload accepted by auth endpoints.
// It currently requires an email and password from the client.
type AuthRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Register validates input and creates a new user account.
// It returns the created user plus freshly issued auth tokens.
func (h *AuthHandler) Register(c *gin.Context) {
	var req AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid request body")
		return
	}

	if !isValidEmail(req.Email) {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid email format")
		return
	}

	if len(req.Password) < 8 {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Password must be at least 8 characters")
		return
	}

	user, accessToken, refreshToken, err := h.service.Register(req.Email, req.Password)
	if err != nil {
		if err == ErrEmailExists {
			response.Error(c, http.StatusConflict, "EMAIL_ALREADY_EXISTS", "Email already in use")
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "An unexpected error occurred")
		return
	}

	response.Success(c, http.StatusCreated, gin.H{
		"user":         gin.H{"id": user.ID, "email": user.Email},
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
	}, nil)
}

// Login validates credentials and returns new access credentials.
// It responds with the user identity and both JWT tokens on success.
func (h *AuthHandler) Login(c *gin.Context) {
	var req AuthRequest
	if err := h.shouldBindJSON(c, &req); err != nil {
		return
	}

	user, accessToken, refreshToken, err := h.service.Login(req.Email, req.Password)
	if err != nil {
		if err == ErrInvalidCredentials {
			response.Error(c, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Invalid email or password")
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "An unexpected error occurred")
		return
	}

	response.Success(c, http.StatusOK, gin.H{
		"user":         gin.H{"id": user.ID, "email": user.Email},
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
	}, nil)
}

// Logout revokes the refresh token sent in the authorization header.
// It returns no content when the token is successfully invalidated.
func (h *AuthHandler) Logout(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Missing or invalid token")
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")
	err := h.service.Logout(token)
	if err != nil {
		if err.Error() == "UNAUTHORIZED" {
			response.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", "Invalid token")
			return
		}
		response.Error(c, http.StatusInternalServerError, "INTERNAL_ERROR", "An unexpected error occurred")
		return
	}

	c.Status(http.StatusNoContent)
}

// shouldBindJSON parses the request body into the target object.
// It sends a validation error response when binding fails.
func (h *AuthHandler) shouldBindJSON(c *gin.Context, obj interface{}) error {
	if err := c.ShouldBindJSON(obj); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid request body")
		return err
	}
	return nil
}

// isValidEmail checks whether the input matches the accepted email format.
// It normalizes casing before applying the validation regex.
func isValidEmail(email string) bool {
	re := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
	return re.MatchString(strings.ToLower(email))
}
