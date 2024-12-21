package utils

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
)

var secretKey = []byte(os.Getenv("SECRET_KEY"))

func GenerateJWT(userID int) (string, string, error) {
	accessToken := jwt.New(jwt.SigningMethodHS256)
	accessTokenClaims := accessToken.Claims.(jwt.MapClaims)
	accessTokenClaims["user_id"] = userID
	accessTokenClaims["exp"] = time.Now().Add(time.Minute * 15).Unix()

	accessTokenString, err := accessToken.SignedString(secretKey)
	if err != nil {
		log.Println("Error signing the access token:", err)
		return "", "", err
	}

	refreshToken := jwt.New(jwt.SigningMethodHS256)
	refreshTokenClaims := refreshToken.Claims.(jwt.MapClaims)
	refreshTokenClaims["user_id"] = userID
	refreshTokenClaims["exp"] = time.Now().Add(time.Hour * 24).Unix()

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
