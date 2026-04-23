// Package response provides shared API response envelopes.
// It keeps success and error payloads consistent across handlers.
package response

import (
	"github.com/gin-gonic/gin"
)

// SuccessResponse defines the standard JSON body for successful requests.
// It carries the response data and optional metadata.
type SuccessResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Meta    interface{} `json:"meta,omitempty"`
}

// ErrorResponse defines the standard JSON body for failed requests.
// It wraps a structured error object for client-side handling.
type ErrorResponse struct {
	Success bool        `json:"success"`
	Error   ErrorDetail `json:"error"`
}

// ErrorDetail describes the machine-readable and human-readable error fields.
// Clients can inspect the code while displaying the message.
type ErrorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// Success writes a success response with the provided payload.
// It keeps handler output consistent for successful requests.
func Success(c *gin.Context, statusCode int, data interface{}, meta interface{}) {
	c.JSON(statusCode, SuccessResponse{
		Success: true,
		Data:    data,
		Meta:    meta,
	})
}

// Error writes a structured error response with a status code.
// It standardizes error payloads returned by handlers and middleware.
func Error(c *gin.Context, statusCode int, code string, message string) {
	c.JSON(statusCode, ErrorResponse{
		Success: false,
		Error: ErrorDetail{
			Code:    code,
			Message: message,
		},
	})
}
