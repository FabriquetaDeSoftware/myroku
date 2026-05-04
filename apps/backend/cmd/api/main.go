package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/FabriquetaDeSoftware/myroku/internal/docker"
	httpRouter "github.com/FabriquetaDeSoftware/myroku/internal/http"
)

func main() {
	dockerService := docker.NewService()
	dockerHandler := docker.NewHandler(dockerService)
	router := httpRouter.NewRouter(dockerHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8888"
	}

	addr := ":" + port
	fmt.Printf("Server is running on http://localhost%s\n", addr)
	log.Fatal(http.ListenAndServe(addr, router))
}
