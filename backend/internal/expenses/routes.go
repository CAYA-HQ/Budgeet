// Package expenses contains expense route wiring.
package expenses

import (
	"database/sql"

	"github.com/CAYA-HQ/Spendwise-backend/pkg/middleware"
	"github.com/gin-gonic/gin"
)

// RegisterRoutes mounts the expense endpoints on the router group.
func RegisterRoutes(r *gin.RouterGroup, db *sql.DB) {
	service := NewExpenseService(db)
	handler := NewExpenseHandler(service)

	expenses := r.Group("/expenses")
	expenses.Use(middleware.AuthMiddleware())
	{
		expenses.POST("", handler.Create)
		expenses.GET("", handler.List)
		expenses.PATCH("/:id", handler.Update)
		expenses.DELETE("/:id", handler.Delete)
	}
}
