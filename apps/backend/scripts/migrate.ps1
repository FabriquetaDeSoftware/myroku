#!/usr/bin/env pwsh
# Apply *.up.sql migrations against the database in DATABASE_URL.
# Requires `psql` available on PATH.
# Usage (from apps/backend): pwsh scripts/migrate.ps1

$ErrorActionPreference = "Stop"

Push-Location (Join-Path $PSScriptRoot "..")
try {
    if (-not $env:DATABASE_URL) {
        $envFile = ".env"
        if (Test-Path $envFile) {
            Get-Content $envFile | ForEach-Object {
                if ($_ -match "^\s*DATABASE_URL\s*=\s*(.+)$") {
                    $env:DATABASE_URL = $Matches[1].Trim().Trim('"').Trim("'")
                }
            }
        }
    }

    if (-not $env:DATABASE_URL) {
        throw "DATABASE_URL is not set. Add it to .env or export it before running."
    }

    Get-ChildItem sql/migrations -Filter "*.up.sql" | Sort-Object Name | ForEach-Object {
        Write-Host "==> applying $($_.Name)" -ForegroundColor Cyan
        & psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f $_.FullName
        if ($LASTEXITCODE -ne 0) {
            throw "psql failed on $($_.Name)"
        }
    }

    Write-Host "==> migrations applied" -ForegroundColor Green
}
finally {
    Pop-Location
}
