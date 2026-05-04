# syntax=docker/dockerfile:1.7

FROM golang:1.26-alpine AS builder
WORKDIR /src
COPY go.mod ./
# COPY go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w" \
    -trimpath \
    -o /out/api ./cmd/api

FROM alpine:3.20
WORKDIR /app
RUN apk add --no-cache docker-cli
COPY --from=builder /out/api /app/api
EXPOSE 8888
ENTRYPOINT ["/app/api"]
