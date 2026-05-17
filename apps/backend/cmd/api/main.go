package main

import (
	"context"
	"log"

	"github.com/FabriquetaDeSoftware/myroku/internal/app"
)

//	@title			Myroku API
//	@version		0.1.0
//	@description	HTTP API for the Myroku backend. Built with Go (net/http), PostgreSQL (pgx + sqlc).
//	@contact.name	Fabriqueta de Software
//	@host			localhost:8888
//	@BasePath		/
//	@schemes		http https
//
//	@tag.name			System
//	@tag.description	Healthchecks and meta endpoints.
//	@tag.name			Users
//	@tag.description	Operations on user accounts.
func main() {
	if err := app.Run(context.Background()); err != nil {
		log.Fatalf("app: %v", err)
	}
}
