package handler

import "net/http"

// HealthResponse is the body returned by GET /health.
type HealthResponse struct {
	Status string `json:"status" example:"ok"`
}

// Health godoc
//
//	@Summary		Liveness probe
//	@Description	Returns `{"status":"ok"}` when the process is up.
//	@Tags			System
//	@Produce		json
//	@Success		200	{object}	HealthResponse
//	@Router			/health [get]
func Health(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write([]byte(`{"status":"ok"}`))
}
