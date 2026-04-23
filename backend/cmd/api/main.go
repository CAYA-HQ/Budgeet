package main

import (
	"log"
	"os"

	"github.com/CAYA-HQ/Spendwise-backend/internal/auth"
	"github.com/CAYA-HQ/Spendwise-backend/pkg/db"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from environment")
	}

	db.InitDB()

	r := gin.Default()

	// API V1 Group
	v1 := r.Group("/api/v1")
	{
		auth.RegisterRoutes(v1, db.DB)
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
