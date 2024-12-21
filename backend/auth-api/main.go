package main

import (
	"auth-api/config"
	"auth-api/globals"
	"auth-api/handlers"
	"auth-api/middleware"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var httpPort = ":8080"
var httpsPort = ":8443"

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

	_, tlsPort, err := net.SplitHostPort(httpsPort)
	if err != nil {
		log.Fatal(err)
		return
	}
	go redirectToHTTPS(tlsPort)

	if err := r.RunTLS(httpsPort, "certifs/cert.crt", "certifs/private.key"); err != nil {
		log.Fatal("Failed to start HTTPS server: ", err)
	}
}

func redirectToHTTPS(tlsPort string) {
	httpSrv := http.Server{
		Addr: httpPort,
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			host, _, _ := net.SplitHostPort(r.Host)
			u := r.URL
			u.Host = net.JoinHostPort(host, tlsPort)
			u.Scheme = "https"
			log.Println(u.String())
			http.Redirect(w, r, u.String(), http.StatusMovedPermanently)
		}),
	}
	log.Println(httpSrv.ListenAndServe())
}
