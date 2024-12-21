package main

import (
	"auth-api/config"
	"auth-api/handlers"
	"auth-api/middleware"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	db, err := config.InitDB()
	if err != nil {
		log.Fatal(err)
	}

	r := gin.Default()

	authRoutes := r.Group("/auth")
	{
		authRoutes.POST("/register", handlers.Register(db))
		authRoutes.POST("/login", handlers.Login(db))
		authRoutes.POST("/refresh", handlers.RefreshToken(db))
	}

	protectedRoutes := r.Group("/protected")
	protectedRoutes.Use(middleware.Authenticate())
	{
		protectedRoutes.GET("/", handlers.Protected)
	}

	if err := r.Run(":8080"); err != nil {
		fmt.Println("Server failed to start:", err)
	}
}
