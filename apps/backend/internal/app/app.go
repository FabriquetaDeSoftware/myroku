package app

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/FabriquetaDeSoftware/myroku/internal/config"
	"github.com/FabriquetaDeSoftware/myroku/internal/db"
	"github.com/FabriquetaDeSoftware/myroku/internal/handler"
	"github.com/FabriquetaDeSoftware/myroku/internal/router"
	"github.com/FabriquetaDeSoftware/myroku/internal/service"
	"github.com/jackc/pgx/v5"
)

func Run(ctx context.Context) error {
	cfg, err := config.Load(".env")
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	ctx, stop := signal.NotifyContext(ctx, syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	conn, err := pgx.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("connect database: %w", err)
	}
	defer conn.Close(context.Background())

	queries := db.New(conn)
	userSvc := service.NewUser(queries)
	handlers := handler.NewHandlers(userSvc, cfg.OpenAPIPath)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router.New(handlers),
		ReadHeaderTimeout: 5 * time.Second,
	}

	errCh := make(chan error, 1)
	go func() {
		slog.Info("server starting", "port", cfg.Port, "docs", fmt.Sprintf("http://localhost:%s/docs", cfg.Port))
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
			return
		}
		errCh <- nil
	}()

	select {
	case <-ctx.Done():
		slog.Info("shutdown signal received")
	case err := <-errCh:
		return err
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("server shutdown: %w", err)
	}
	slog.Info("server stopped")
	return nil
}
