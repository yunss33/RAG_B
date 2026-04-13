from __future__ import annotations

from pathlib import Path

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from deepbs_common.repository import repository
from deepbs_common.schemas import (
    CreateProjectRequest,
    FileType,
    FinalHtmlResponse,
    ImageSelection,
    IngestResponse,
    Project,
    ProjectResponse,
    ProjectStage,
    ProjectStatusResponse,
    RunResponse,
    SourceFile,
)
from deepbs_common.settings import settings
from deepbs_common.storage import storage

app = FastAPI(title="DeepBS API Gateway", version="0.1.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _project_status(project: Project) -> ProjectStatusResponse:
    return ProjectStatusResponse(
        project_id=project.id,
        stage=project.run_state.stage,
        waiting_for_user=project.run_state.waiting_for_user,
        blocked_reason=project.run_state.blocked_reason,
        source_file_count=len(project.source_files),
        requirement_count=len(project.requirements),
        draft_count=len(project.drafts),
        review_issue_count=len(project.review_issues),
        image_suggestion_count=len(project.image_suggestions),
        final_html_ready=bool(project.final_html_object_key),
    )


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/projects")
async def list_projects() -> list[Project]:
    return repository.list_projects()


@app.get("/projects/{project_id}")
async def get_project(project_id: str) -> Project:
    try:
        return repository.get_project(project_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc


@app.post("/projects", response_model=ProjectResponse)
async def create_project(payload: CreateProjectRequest) -> ProjectResponse:
    project = Project(
        name=payload.name,
        description=payload.description,
        target_language=payload.target_language,
    )
    repository.create_project(project)
    return ProjectResponse(project_id=project.id)


@app.post("/projects/{project_id}/files")
async def upload_file(
    project_id: str,
    file: UploadFile = File(...),
    file_type: FileType = Form(...),
) -> SourceFile:
    try:
        project = repository.get_project(project_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc

    content = await file.read()
    object_key = storage.put_file(file.filename, content)
    source_file = SourceFile(
        file_name=file.filename,
        file_type=file_type,
        object_key=object_key,
        mime_type=file.content_type,
    )
    project.source_files.append(source_file)
    repository.save_project(project)
    return source_file


@app.post("/projects/{project_id}/ingest", response_model=IngestResponse)
async def ingest_project(project_id: str) -> IngestResponse:
    try:
        project = repository.get_project(project_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc

    project.run_state.stage = ProjectStage.ingesting
    project.run_state.waiting_for_user = False
    project.run_state.blocked_reason = None
    repository.save_project(project)

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(f"{settings.rag_service_base_url}/internal/projects/{project_id}/ingest")
        response.raise_for_status()
        payload = response.json()

    updated = repository.get_project(project_id)
    return IngestResponse(
        project_id=project_id,
        stage=updated.run_state.stage,
        ingested_files=payload["ingested_files"],
        evidence_items=payload["evidence_items"],
        image_candidates=payload["image_candidates"],
    )


@app.post("/projects/{project_id}/run", response_model=RunResponse)
async def run_project(project_id: str) -> RunResponse:
    try:
        repository.get_project(project_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(f"{settings.orchestrator_base_url}/internal/projects/{project_id}/run")
        response.raise_for_status()
        payload = response.json()
    return RunResponse.model_validate(payload)


@app.get("/projects/{project_id}/status", response_model=ProjectStatusResponse)
async def project_status(project_id: str) -> ProjectStatusResponse:
    try:
        project = repository.get_project(project_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc
    return _project_status(project)


@app.get("/projects/{project_id}/requirements")
async def get_requirements(project_id: str):
    try:
        return repository.get_project(project_id).requirements
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc


@app.get("/projects/{project_id}/outline")
async def get_outline(project_id: str):
    try:
        return repository.get_project(project_id).outline
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc


@app.get("/projects/{project_id}/drafts")
async def get_drafts(project_id: str):
    try:
        project = repository.get_project(project_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc
    return {"drafts": project.drafts, "review_issues": project.review_issues}


@app.get("/projects/{project_id}/image-suggestions")
async def get_image_suggestions(project_id: str):
    try:
        return repository.get_project(project_id).image_suggestions
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc


@app.post("/projects/{project_id}/image-selections", response_model=RunResponse)
async def set_image_selections(project_id: str, selections: list[ImageSelection]) -> RunResponse:
    try:
        project = repository.get_project(project_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc

    project.image_selections = selections
    repository.save_project(project)

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(f"{settings.orchestrator_base_url}/internal/projects/{project_id}/resume")
        response.raise_for_status()
        payload = response.json()
    return RunResponse.model_validate(payload)


@app.get("/projects/{project_id}/final-html", response_model=FinalHtmlResponse)
async def get_final_html(project_id: str) -> FinalHtmlResponse:
    try:
        project = repository.get_project(project_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc

    if not project.final_html_object_key:
        return FinalHtmlResponse(project_id=project_id, html=None, url=None)

    html = storage.read_text(project.final_html_object_key)
    return FinalHtmlResponse(
        project_id=project_id,
        html=html,
        url=storage.get_file_url(project.final_html_object_key),
    )


@app.get("/objects/{object_key}")
async def serve_object(object_key: str):
    path = Path(settings.object_dir) / object_key
    if not path.exists():
        raise HTTPException(status_code=404, detail="object not found")
    return FileResponse(path)
