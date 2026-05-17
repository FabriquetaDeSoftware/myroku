#!/usr/bin/env pwsh
# Quick dev entrypoint: regenerate swagger spec then run the API.
# Usage (from apps/backend): pwsh scripts/dev.ps1

$ErrorActionPreference = "Stop"

Push-Location (Join-Path $PSScriptRoot "..")
try {
    Write-Host "==> generating swagger spec into api/" -ForegroundColor Cyan
    go run github.com/swaggo/swag/cmd/swag@latest init `
        -g cmd/api/main.go `
        --parseInternal `
        --parseDependency `
        -o api

    Write-Host "==> starting API server" -ForegroundColor Cyan
    go run ./cmd/api
}
finally {
    Pop-Location
}
