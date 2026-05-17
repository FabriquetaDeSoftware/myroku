package handler

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/FabriquetaDeSoftware/myroku/internal/db"
	"github.com/jackc/pgx/v5"
)

type UserService interface {
	GetByEmail(ctx context.Context, email string) (db.User, error)
}

type UserHandler struct {
	svc UserService
}

func NewUser(svc UserService) *UserHandler {
	return &UserHandler{svc: svc}
}

// ErrorResponse is the body returned for non-2xx responses.
type ErrorResponse struct {
	Error string `json:"error" example:"user not found"`
}

// GetByEmail godoc
//
//	@Summary		Get user by email
//	@Description	Returns the user whose `email` matches and that has not been soft-deleted.
//	@Tags			Users
//	@Produce		json
//	@Param			email	path		string	true	"User email"	example(email@example.com)
//	@Success		200		{object}	db.User
//	@Failure		404		{object}	ErrorResponse
//	@Failure		500		{object}	ErrorResponse
//	@Router			/users/{email} [get]
func (h *UserHandler) GetByEmail(w http.ResponseWriter, r *http.Request) {
	email := r.PathValue("email")

	user, err := h.svc.GetByEmail(r.Context(), email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "user not found"})
			return
		}
		slog.Error("get user by email", "err", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "internal server error"})
		return
	}

	writeJSON(w, http.StatusOK, user)
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(body); err != nil {
		slog.Error("encode response", "err", err)
	}
}
