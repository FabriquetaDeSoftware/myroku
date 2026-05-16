package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/FabriquetaDeSoftware/myroku/internal/config/dotenv"
	"github.com/FabriquetaDeSoftware/myroku/internal/db"
	"github.com/jackc/pgx/v5"
)

func main() {
	dotenv.Load(".env")
	port := dotenv.Env.Port
	databaseUrl := dotenv.Env.DatabaseURL

	conn, err := pgx.Connect(context.Background(), databaseUrl)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close(context.Background())

	queries := db.New(conn)

	fmt.Printf("Server starting...\n")
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		email := "email@example.com"

		user, err := queries.GetUserByEmail(r.Context(), email)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				http.Error(w, "user not found", http.StatusNotFound)
				return
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(user); err != nil {
			log.Printf("failed to encode response: %v", err)
		}
	})

	fmt.Printf("Server is running on http://localhost:%s\n", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("Server failed to start: %v\n", err)
	}
}
