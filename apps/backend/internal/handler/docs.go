package handler

import (
	"encoding/json"
	"net/http"
	"os"
)

const scalarHTML = `<!doctype html>
<html lang="en">
  <head>
    <title>Myroku API Docs</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script id="api-reference" data-url="/swagger.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`

type DocsHandler struct {
	openAPIPath string
}

func NewDocs(openAPIPath string) *DocsHandler {
	return &DocsHandler{openAPIPath: openAPIPath}
}

func (h *DocsHandler) UI(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_, _ = w.Write([]byte(scalarHTML))
}

func (h *DocsHandler) Spec(w http.ResponseWriter, r *http.Request) {
	data, err := os.ReadFile(h.openAPIPath)
	if err != nil {
		http.Error(w, `{"error":"spec not generated yet — run 'make swag'"}`, http.StatusServiceUnavailable)
		return
	}

	var spec map[string]any
	if err := json.Unmarshal(data, &spec); err == nil {
		delete(spec, "host")
		delete(spec, "schemes")
		if out, err := json.Marshal(spec); err == nil {
			data = out
		}
	}

	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write(data)
}
