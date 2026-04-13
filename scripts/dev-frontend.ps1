$ErrorActionPreference = "Stop"
Set-Location "D:\xm\DeepBS\apps\frontend"

$env:NEXT_PUBLIC_API_BASE_URL = "http://localhost:8100"
$env:INTERNAL_API_BASE_URL = "http://localhost:8100"

Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
npm install --no-audit --no-fund

Write-Host "Starting frontend on 3000..." -ForegroundColor Green
npm run dev

