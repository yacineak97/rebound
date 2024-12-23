package middleware

import (
	"auth-api/config"
	"auth-api/globals"
	"log"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	config, err := config.LoadConfig(globals.ConfigFilePath)
	if err != nil {
		log.Println("Error loading config file:", err)

		return func(c *gin.Context) {
			c.Next()
		}
	}

	clientUrl := config["client_url"].(string)

	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", clientUrl)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
