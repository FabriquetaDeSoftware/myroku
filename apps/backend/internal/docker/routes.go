package docker

import "net/http"

func RegisterRoutes(prefix string, mux *http.ServeMux, h *Handler) {
	mux.HandleFunc(prefix+"/containers", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			h.ListAllContainers(w, r)
		default:
			http.NotFound(w, r)
		}
	})
}
