package auth

import (
	"net/http"
	"regexp"
	"strings"

	"github.com/CAYA-HQ/Spendwise-backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service *AuthService
}

func NewAuthHandler(service *AuthService) *AuthHandler {
	return &AuthHandler{service: service}
}

type AuthRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

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

func (h *AuthHandler) shouldBindJSON(c *gin.Context, obj interface{}) error {
	if err := c.ShouldBindJSON(obj); err != nil {
		response.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid request body")
		return err
	}
	return nil
}

func isValidEmail(email string) bool {
	re := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
	return re.MatchString(strings.ToLower(email))
}
