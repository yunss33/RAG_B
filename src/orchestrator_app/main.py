from __future__ import annotations

import httpx
from fastapi import FastAPI, HTTPException

from deepbs_common.repository import repository
from deepbs_common.schemas import AgentRequest, ProjectStage, RunResponse
from deepbs_common.settings import settings
from deepbs_common.storage import storage

app = FastAPI(title="DeepBS Orchestrator", version="0.1.0")


async def _agent_post(path: str, project):
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            f"{settings.agent_runtime_base_url}{path}",
            json=AgentRequest(project=project).model_dump(mode="json"),
        )
        response.raise_for_status()
        return response.json()


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/internal/projects/{project_id}/run", response_model=RunResponse)
async def run_project(project_id: str) -> RunResponse:
    try:
        project = repository.get_project(project_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc

    project.run_state.stage = ProjectStage.planning
    project.run_state.waiting_for_user = False
    project.run_state.blocked_reason = None
    project.run_state.task_tree = [{"task": "parse_requirements", "status": "running"}]
    repository.save_project(project)

    requirements_payload = await _agent_post("/internal/parse-tender", project)
    project.requirements = requirements_payload["requirements"]
    repository.save_project(project)

    outline_payload = await _agent_post("/internal/plan-outline", repository.get_project(project_id))
    project = repository.get_project(project_id)
    project.outline = outline_payload["outline"]
    project.run_state.stage = ProjectStage.drafting
    project.run_state.task_tree.append({"task": "plan_outline", "status": "completed"})
    repository.save_project(project)

    drafts_payload = await _agent_post("/internal/write-drafts", repository.get_project(project_id))
    project = repository.get_project(project_id)
    project.drafts = drafts_payload["drafts"]
    repository.save_project(project)

    review_payload = await _agent_post("/internal/review", repository.get_project(project_id))
    project = repository.get_project(project_id)
    project.review_issues = review_payload["review_issues"]
    project.run_state.stage = ProjectStage.reviewing
    repository.save_project(project)

    images_payload = await _agent_post("/internal/suggest-images", repository.get_project(project_id))
    project = repository.get_project(project_id)
    project.image_suggestions = images_payload["image_suggestions"]
    project.run_state.stage = ProjectStage.waiting_user
    project.run_state.waiting_for_user = True
    project.run_state.blocked_reason = "等待用户确认图片建议并继续成稿装配。"
    project.run_state.task_tree.extend(
        [
            {"task": "write_drafts", "status": "completed"},
            {"task": "review", "status": "completed"},
            {"task": "suggest_images", "status": "completed"},
        ]
    )
    repository.save_project(project)

    return RunResponse(
        project_id=project_id,
        stage=project.run_state.stage,
        waiting_for_user=project.run_state.waiting_for_user,
    )


@app.post("/internal/projects/{project_id}/resume", response_model=RunResponse)
async def resume_project(project_id: str) -> RunResponse:
    try:
        project = repository.get_project(project_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc

    project.run_state.stage = ProjectStage.assembling
    project.run_state.waiting_for_user = False
    project.run_state.blocked_reason = None
    repository.save_project(project)

    html_payload = await _agent_post("/internal/assemble-html", project)
    final_key = storage.put_file(f"{project.name}-final.html", html_payload["html"].encode("utf-8"))
    project = repository.get_project(project_id)
    project.final_html_object_key = final_key
    project.run_state.stage = ProjectStage.completed
    project.run_state.task_tree.append({"task": "assemble_html", "status": "completed"})
    repository.save_project(project)

    return RunResponse(
        project_id=project_id,
        stage=project.run_state.stage,
        waiting_for_user=project.run_state.waiting_for_user,
    )
