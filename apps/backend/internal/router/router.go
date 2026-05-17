package router

import (
	"net/http"

	"github.com/FabriquetaDeSoftware/myroku/internal/handler"
	"github.com/FabriquetaDeSoftware/myroku/internal/middleware"
)

func New(h *handler.Handlers) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", handler.Health)
	mux.HandleFunc("GET /users/{email}", h.User.GetByEmail)

	mux.HandleFunc("GET /docs", h.Docs.UI)
	mux.HandleFunc("GET /swagger.json", h.Docs.Spec)

	return middleware.Logger(middleware.Recover(mux))
}
