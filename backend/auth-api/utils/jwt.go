package utils

import (
	"fmt"
	"log"
	"os"
	"time"

	"auth-api/config"
	"auth-api/globals"

	"github.com/dgrijalva/jwt-go"
)

var secretKey = []byte(os.Getenv("SECRET_KEY"))

func GenerateJWT(userID int) (string, string, error) {
	config, err := config.LoadConfig(globals.ConfigFilePath)
	if err != nil {
		log.Println("Error loading config file:", err)
		return "", "", err
	}

	accessTokenExpiration := config["access_token_expiration"].(int)
	refreshTokenExpiration := config["refresh_token_expiration"].(int)

	accessToken := jwt.New(jwt.SigningMethodHS256)
	accessTokenClaims := accessToken.Claims.(jwt.MapClaims)
	accessTokenClaims["user_id"] = userID
	accessTokenClaims["exp"] = time.Now().Add(time.Second * time.Duration(accessTokenExpiration)).Unix()

	accessTokenString, err := accessToken.SignedString(secretKey)
	if err != nil {
		log.Println("Error signing the access token:", err)
		return "", "", err
	}

	refreshToken := jwt.New(jwt.SigningMethodHS256)
	refreshTokenClaims := refreshToken.Claims.(jwt.MapClaims)
	refreshTokenClaims["user_id"] = userID
	refreshTokenClaims["exp"] = time.Now().Add(time.Second * time.Duration(refreshTokenExpiration)).Unix()

	refreshTokenString, err := refreshToken.SignedString(secretKey)
	if err != nil {
		log.Println("Error signing the refresh token:", err)
		return "", "", err
	}

	return accessTokenString, refreshTokenString, nil
}

func VerifyToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("invalid signing method")
		}

		return secretKey, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}
