$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "Bootstrapping DeepBS without Docker..." -ForegroundColor Cyan
uv sync --extra dev

Start-Process powershell -ArgumentList "-NoExit", "-File", "D:\xm\DeepBS\scripts\dev-backend.ps1"
Start-Process powershell -ArgumentList "-NoExit", "-File", "D:\xm\DeepBS\scripts\dev-frontend.ps1"

Write-Host "Launched backend and frontend scripts." -ForegroundColor Green

