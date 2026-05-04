package http

import (
	"net/http"

	"github.com/FabriquetaDeSoftware/myroku/internal/docker"
)

func NewRouter(
	dockerHandler *docker.Handler,
) *http.ServeMux {
	mux := http.NewServeMux()

	docker.RegisterRoutes("/docker", mux, dockerHandler)

	return mux
}
