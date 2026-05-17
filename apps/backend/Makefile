.PHONY: run build swag sqlc tidy test docker-up docker-down migrate docs

# Run the API locally (requires .env + reachable Postgres).
run:
	go run ./cmd/api

# Build the API binary to ./bin/api.
build:
	go build -o bin/api ./cmd/api

# Regenerate api/swagger.json + api/swagger.yaml from code annotations.
swag:
	go run github.com/swaggo/swag/cmd/swag@latest init \
		-g cmd/api/main.go \
		--parseInternal --parseDependency \
		-o api

# Regenerate sqlc-typed Go code from sql/queries.
sqlc:
	sqlc generate

tidy:
	go mod tidy

test:
	go test ./...

docker-up:
	docker compose -f deployments/docker-compose.yml up -d --build

docker-down:
	docker compose -f deployments/docker-compose.yml down

migrate:
	pwsh scripts/migrate.ps1

docs:
	@echo "Open http://localhost:$${PORT:-8888}/docs in your browser"
