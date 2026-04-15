#!/bin/bash

set -e

echo "Starting DeepBS development environment..."

# Create data directories if they don't exist
mkdir -p data/objects

# Set environment variables
export DEEPBS_DATA_DIR="$(pwd)/data"
export DEEPBS_OBJECT_DIR="$(pwd)/data/objects"
export DEEPBS_PUBLIC_OBJECT_BASE="http://localhost:8100/objects"
export DEEPBS_ORCHESTRATOR_BASE_URL="http://localhost:8101"
export DEEPBS_RAG_SERVICE_BASE_URL="http://localhost:8102"
export DEEPBS_AGENT_RUNTIME_BASE_URL="http://localhost:8103"

# Start backend services in separate terminals
echo "Starting agent-runtime service on port 8103..."
uv run uvicorn agent_runtime_app.main:app --host 0.0.0.0 --port 8103 &
sleep 2

echo "Starting rag-service on port 8102..."
uv run uvicorn rag_service_app.main:app --host 0.0.0.0 --port 8102 &
sleep 2

echo "Starting orchestrator on port 8101..."
uv run uvicorn orchestrator_app.main:app --host 0.0.0.0 --port 8101 &
sleep 2

echo "Starting api-gateway on port 8100..."
uv run uvicorn api_app.main:app --host 0.0.0.0 --port 8100 &
sleep 3

# Start frontend
echo "Starting frontend on port 3000..."
cd apps/frontend
export NEXT_PUBLIC_API_BASE_URL="http://localhost:8100"
export INTERNAL_API_BASE_URL="http://localhost:8100"
npm install --no-audit --no-fund
npm run dev
