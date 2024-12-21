package handlers

import (
	"auth-api/config"
	"auth-api/globals"
	"auth-api/hash"
	"auth-api/models"
	"auth-api/utils"
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Register(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		config, err := config.LoadConfig(globals.ConfigFilePath)
		if err != nil {
			log.Println("Error loading config file:", err)
			return
		}

		accessTokenExpiration := config["access_token_expiration"].(int)
		refreshTokenExpiration := config["refresh_token_expiration"].(int)
		domain := config["domain"].(string)

		var input models.User
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
			return
		}

		var existingUser models.User
		err = db.QueryRow("SELECT id, username, email FROM users WHERE username=$1 OR email=$2", input.Username, input.Email).Scan(&existingUser.ID, &existingUser.Username, &existingUser.Email)
		if err == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username or Email already taken"})
			return
		}

		hashedPassword, err := hash.HashPassword(input.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing the password"})
			return
		}

		var newUser models.User
		err = db.QueryRow("INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id", input.Username, input.Email, hashedPassword).Scan(&newUser.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error registering user"})
			return
		}

		accessToken, refreshToken, err := utils.GenerateJWT(newUser.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating tokens"})
			return
		}

		c.SetCookie("access_token", accessToken, accessTokenExpiration, "/", domain, false, true)
		c.SetCookie("refresh_token", refreshToken, refreshTokenExpiration, "/", domain, false, true)
		c.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
	}
}

func Login(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		config, err := config.LoadConfig(globals.ConfigFilePath)
		if err != nil {
			log.Println("Error loading config file:", err)
			return
		}

		accessTokenExpiration := config["access_token_expiration"].(int)
		refreshTokenExpiration := config["refresh_token_expiration"].(int)
		domain := config["domain"].(string)

		var input models.User
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
			return
		}

		var user models.User
		err = db.QueryRow("SELECT id, username, email, password FROM users WHERE email=$1", input.Email).Scan(&user.ID, &user.Username, &user.Email, &user.Password)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		if !hash.CheckPasswordHash(input.Password, user.Password) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		accessToken, refreshToken, err := utils.GenerateJWT(user.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating tokens"})
			return
		}

		c.SetCookie("access_token", accessToken, accessTokenExpiration, "/", domain, false, true)
		c.SetCookie("refresh_token", refreshToken, refreshTokenExpiration, "/", domain, false, true)

		c.JSON(http.StatusOK, gin.H{
			"message": "Login successful",
		})
	}
}

func RefreshToken(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		config, err := config.LoadConfig(globals.ConfigFilePath)
		if err != nil {
			log.Println("Error loading config file:", err)
			return
		}

		accessTokenExpiration := config["access_token_expiration"].(int)
		refreshTokenExpiration := config["refresh_token_expiration"].(int)
		domain := config["domain"].(string)

		var input struct {
			RefreshToken string `json:"refresh_token"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
			return
		}

		claims, err := utils.VerifyToken(input.RefreshToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
			return
		}

		userID := int(claims["user_id"].(float64))
		accessToken, refreshToken, err := utils.GenerateJWT(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating tokens"})
			return
		}

		c.SetCookie("access_token", accessToken, accessTokenExpiration, "/", domain, false, true)
		c.SetCookie("refresh_token", refreshToken, refreshTokenExpiration, "/", domain, false, true)

		c.JSON(http.StatusOK, gin.H{
			"message": "Token refreshed successfully",
		})

	}
}

func Protected(c *gin.Context) {
	userID := int(c.MustGet("user_id").(float64))
	c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("Welcome, user %d!", userID)})
}

func DeleteCookieHandler(c *gin.Context) {
	config, err := config.LoadConfig(globals.ConfigFilePath)
	if err != nil {
		log.Println("Error loading config file:", err)
		return
	}

	domain := config["domain"].(string)
	// Deleting cookies by setting their max age to -1 and value to ""
	c.SetCookie("access_token", "", -1, "/", domain, false, true)
	c.SetCookie("refresh_token", "", -1, "/", domain, false, true)
	c.String(http.StatusOK, "Cookies have been deleted")
}
