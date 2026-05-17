# syntax=docker/dockerfile:1.7
#
# Build context: the apps/backend directory.
# Usage: docker build -f build/package/Dockerfile -t myroku-backend .

FROM golang:1.26-alpine AS builder
WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN go run github.com/swaggo/swag/cmd/swag@latest init \
    -g cmd/api/main.go \
    --parseInternal --parseDependency \
    -o api
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w" \
    -trimpath \
    -o /out/api ./cmd/api

FROM alpine:3.20
WORKDIR /app
RUN apk add --no-cache docker-cli
COPY --from=builder /out/api /app/api
COPY --from=builder /src/api /app/api-spec
ENV OPENAPI_PATH=/app/api-spec/swagger.json
EXPOSE 8888
ENTRYPOINT ["/app/api"]
