// Package auth contains authentication business logic and HTTP adapters.
// It handles token creation, credential checks, and route wiring.
package auth

import (
	"database/sql"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes mounts the authentication endpoints on the router group.
// It wires the auth service and handlers to the provided database handle.
func RegisterRoutes(r *gin.RouterGroup, db *sql.DB) {
	service := NewAuthService(db)
	handler := NewAuthHandler(service)

	auth := r.Group("/auth")
	{
		auth.POST("/register", handler.Register)
		auth.POST("/login", handler.Login)
		auth.POST("/logout", handler.Logout)
	}
}
