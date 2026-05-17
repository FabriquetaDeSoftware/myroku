package integration_test

import (
	"context"
	"os"
	"testing"

	"github.com/FabriquetaDeSoftware/myroku/internal/db"
	"github.com/jackc/pgx/v5"
)

// TestGetUserByEmail is a scaffold for a real integration test against Postgres.
// Skipped under `go test -short`; enable by exporting INTEGRATION_DATABASE_URL.
func TestGetUserByEmail(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short mode")
	}

	dsn := os.Getenv("INTEGRATION_DATABASE_URL")
	if dsn == "" {
		t.Skip("set INTEGRATION_DATABASE_URL to run this test")
	}

	ctx := context.Background()
	conn, err := pgx.Connect(ctx, dsn)
	if err != nil {
		t.Fatalf("connect: %v", err)
	}
	defer conn.Close(ctx)

	q := db.New(conn)
	_, err = q.GetUserByEmail(ctx, "nonexistent@example.com")
	if err == nil {
		t.Fatal("expected error for missing user, got nil")
	}
}
