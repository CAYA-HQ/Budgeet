// Package database manages the GORM database connection.
// It also handles schema migration for application models.
package database

import (
	"fmt"
	"log"
	"os"

	"github.com/CAYA-HQ/Spendwise-backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB stores the shared GORM database handle.
// It is initialized once during application startup.
var DB *gorm.DB

// InitDB opens the configured PostgreSQL connection.
// It also runs the required auto-migrations before serving traffic.
func InitDB() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		host := os.Getenv("DB_HOST")
		user := os.Getenv("DB_USER")
		password := os.Getenv("DB_PASSWORD")
		dbname := os.Getenv("DB_NAME")
		port := os.Getenv("DB_PORT")
		sslmode := os.Getenv("DB_SSLMODE")

		if sslmode == "" {
			sslmode = "disable"
		}

		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
			host, user, password, dbname, port, sslmode)
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	err = db.AutoMigrate(&models.User{}, &models.RefreshToken{})
	if err != nil {
		log.Fatalf("Failed to run auto-migration: %v", err)
	}

	DB = db
}
