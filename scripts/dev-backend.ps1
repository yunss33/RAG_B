$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "Starting DeepBS backend services without Docker..." -ForegroundColor Cyan

$env:DEEPBS_DATA_DIR = "D:\xm\DeepBS\data"
$env:DEEPBS_OBJECT_DIR = "D:\xm\DeepBS\data\objects"
$env:DEEPBS_PUBLIC_OBJECT_BASE = "http://localhost:8100/objects"
$env:DEEPBS_ORCHESTRATOR_BASE_URL = "http://localhost:8101"
$env:DEEPBS_RAG_SERVICE_BASE_URL = "http://localhost:8102"
$env:DEEPBS_AGENT_RUNTIME_BASE_URL = "http://localhost:8103"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'D:\xm\DeepBS'; `$env:DEEPBS_DATA_DIR='D:\xm\DeepBS\data'; `$env:DEEPBS_OBJECT_DIR='D:\xm\DeepBS\data\objects'; `$env:DEEPBS_PUBLIC_OBJECT_BASE='http://localhost:8100/objects'; uv run uvicorn agent_runtime_app.main:app --host 0.0.0.0 --port 8103"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'D:\xm\DeepBS'; `$env:DEEPBS_DATA_DIR='D:\xm\DeepBS\data'; `$env:DEEPBS_OBJECT_DIR='D:\xm\DeepBS\data\objects'; `$env:DEEPBS_PUBLIC_OBJECT_BASE='http://localhost:8100/objects'; uv run uvicorn rag_service_app.main:app --host 0.0.0.0 --port 8102"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'D:\xm\DeepBS'; `$env:DEEPBS_DATA_DIR='D:\xm\DeepBS\data'; `$env:DEEPBS_OBJECT_DIR='D:\xm\DeepBS\data\objects'; `$env:DEEPBS_PUBLIC_OBJECT_BASE='http://localhost:8100/objects'; `$env:DEEPBS_AGENT_RUNTIME_BASE_URL='http://localhost:8103'; uv run uvicorn orchestrator_app.main:app --host 0.0.0.0 --port 8101"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'D:\xm\DeepBS'; `$env:DEEPBS_DATA_DIR='D:\xm\DeepBS\data'; `$env:DEEPBS_OBJECT_DIR='D:\xm\DeepBS\data\objects'; `$env:DEEPBS_PUBLIC_OBJECT_BASE='http://localhost:8100/objects'; `$env:DEEPBS_ORCHESTRATOR_BASE_URL='http://localhost:8101'; `$env:DEEPBS_RAG_SERVICE_BASE_URL='http://localhost:8102'; uv run uvicorn api_app.main:app --host 0.0.0.0 --port 8100"

Write-Host "Backend services launched on 8100-8103." -ForegroundColor Green

