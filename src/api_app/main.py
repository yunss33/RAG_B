from __future__ import annotations

from pathlib import Path
from typing import List

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
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
    # 智能体编排系统模型
    Workflow,
    CreateWorkflowRequest,
    WorkflowResponse,
    WorkflowListResponse,
    UpdateWorkflowRequest,
    Memory,
    CreateMemoryRequest,
    MemoryListResponse,
)
from deepbs_common.settings import settings
from deepbs_common.storage import storage

app = FastAPI(title="DeepBS API Gateway", version="0.1.0")

# 工作流存储（临时实现，后续可迁移到数据库）
workflows: dict[str, Workflow] = {}
memories: dict[str, Memory] = {}


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
async def list_projects() -> List[Project]:
    return repository.list_projects()


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


# 智能体编排系统 API

@app.get("/workflows", response_model=WorkflowListResponse)
async def list_workflows() -> WorkflowListResponse:
    return WorkflowListResponse(workflows=list(workflows.values()))


@app.post("/workflows", response_model=WorkflowResponse)
async def create_workflow(payload: CreateWorkflowRequest) -> WorkflowResponse:
    workflow = Workflow(
        name=payload.name,
        description=payload.description,
    )
    workflows[workflow.id] = workflow
    return WorkflowResponse(workflow_id=workflow.id)


@app.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str):
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="workflow not found")
    return workflows[workflow_id]


@app.put("/workflows/{workflow_id}")
async def update_workflow(workflow_id: str, payload: UpdateWorkflowRequest):
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="workflow not found")
    
    workflow = workflows[workflow_id]
    if payload.name is not None:
        workflow.name = payload.name
    if payload.description is not None:
        workflow.description = payload.description
    if payload.agents is not None:
        workflow.agents = payload.agents
    if payload.edges is not None:
        workflow.edges = payload.edges
    workflow.updated_at = workflow.updated_at  # 触发更新时间
    
    workflows[workflow_id] = workflow
    return workflow


@app.delete("/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str):
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="workflow not found")
    del workflows[workflow_id]
    return {"message": "workflow deleted successfully"}


@app.post("/workflows/{workflow_id}/run")
async def run_workflow(workflow_id: str):
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="workflow not found")
    
    workflow = workflows[workflow_id]
    # 这里可以添加工作流执行逻辑
    return {"message": "workflow started", "workflow_id": workflow_id}


# 记忆管理 API

@app.get("/memories", response_model=MemoryListResponse)
async def list_memories() -> MemoryListResponse:
    return MemoryListResponse(memories=list(memories.values()))


@app.post("/memories")
async def create_memory(payload: CreateMemoryRequest):
    memory = Memory(
        name=payload.name,
        type=payload.type,
        content=payload.content,
        access=payload.access,
    )
    memories[memory.id] = memory
    return memory


@app.get("/memories/{memory_id}")
async def get_memory(memory_id: str):
    if memory_id not in memories:
        raise HTTPException(status_code=404, detail="memory not found")
    return memories[memory_id]


@app.delete("/memories/{memory_id}")
async def delete_memory(memory_id: str):
    if memory_id not in memories:
        raise HTTPException(status_code=404, detail="memory not found")
    del memories[memory_id]
    return {"message": "memory deleted successfully"}
