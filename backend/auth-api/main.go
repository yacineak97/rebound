package main

import (
	"auth-api/config"
	"auth-api/globals"
	"auth-api/handlers"
	"auth-api/middleware"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatal("No config file provided.")
	}

	configPath := os.Args[1]
	if _, err := os.Stat(configPath); err == nil {
		globals.ConfigFilePath = configPath
		fmt.Println("Config file path set to:", globals.ConfigFilePath)
	} else {
		log.Fatalf("Config file does not exist: %s\n", configPath)
	}

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

	r.POST("/delete-cookie", handlers.DeleteCookieHandler)

	if err := r.Run(":8080"); err != nil {
		fmt.Println("Server failed to start:", err)
	}
}
