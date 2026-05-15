package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/FabriquetaDeSoftware/myroku/internal/config/dotenv"
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

	fmt.Printf("Server starting...\n")
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Hello, World!")
	})

	fmt.Printf("Server is running on http://localhost:%s\n", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("Server failed to start: %v\n", err)
	}
}
