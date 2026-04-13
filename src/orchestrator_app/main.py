from __future__ import annotations

import asyncio
import httpx
from uuid import uuid4
from fastapi import FastAPI, HTTPException

from deepbs_common.repository import repository
from deepbs_common.schemas import (
    AgentExecutionLog,
    AgentMessage,
    AgentRequest,
    ProjectStage,
    RunResponse,
    utc_now,
)
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


def _create_agent_log(agent_role: str, task_name: str, instance_id: str | None = None) -> AgentExecutionLog:
    instance_id = instance_id or str(uuid4())
    return AgentExecutionLog(
        agent_role=agent_role,
        agent_instance_id=instance_id,
        task_name=task_name,
        status="pending",
    )


def _update_agent_log_status(
    project,
    log_id: str,
    status: str,
    thought_chain: list[str] | None = None,
    intermediate_outputs: list[dict] | None = None,
    final_output: dict | None = None,
    error_message: str | None = None,
):
    for log in project.run_state.agent_logs:
        if log.id == log_id:
            log.status = status
            if status == "running":
                log.start_time = utc_now()
            elif status in ["completed", "failed"]:
                log.end_time = utc_now()
            if thought_chain:
                log.thought_chain = thought_chain
            if intermediate_outputs:
                log.intermediate_outputs = intermediate_outputs
            if final_output:
                log.final_output = final_output
            if error_message:
                log.error_message = error_message
            break
    repository.save_project(project)


def _add_agent_message(
    project,
    from_agent: str,
    message_type: str,
    content: dict,
    to_agent: str | None = None,
):
    msg = AgentMessage(
        from_agent=from_agent,
        to_agent=to_agent,
        message_type=message_type,
        content=content,
    )
    project.run_state.agent_messages.append(msg)
    repository.save_project(project)


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

    parser_log = _create_agent_log("parser", "parse_requirements", "parser-1")
    project.run_state.agent_logs.append(parser_log)
    project.run_state.active_agents["parser-1"] = {"role": "parser", "status": "running"}
    repository.save_project(project)
    _update_agent_log_status(project, parser_log.id, "running")

    requirements_payload = await _agent_post("/internal/parse-tender", project)
    project.requirements = requirements_payload["requirements"]
    _update_agent_log_status(
        project,
        parser_log.id,
        "completed",
        thought_chain=["解析招标文件结构", "提取关键需求", "识别风险点"],
        final_output={"requirements_count": len(project.requirements)},
    )
    project.run_state.active_agents["parser-1"]["status"] = "completed"
    repository.save_project(project)

    planner_log = _create_agent_log("planner", "plan_outline", "planner-1")
    project.run_state.agent_logs.append(planner_log)
    project.run_state.active_agents["planner-1"] = {"role": "planner", "status": "running"}
    repository.save_project(project)
    _update_agent_log_status(project, planner_log.id, "running")

    outline_payload = await _agent_post("/internal/plan-outline", repository.get_project(project_id))
    project = repository.get_project(project_id)
    project.outline = outline_payload["outline"]
    project.run_state.stage = ProjectStage.drafting
    project.run_state.task_tree.append({"task": "plan_outline", "status": "completed"})
    _update_agent_log_status(
        project,
        planner_log.id,
        "completed",
        thought_chain=["分析需求结构", "设计章节框架", "定义证据需求"],
        final_output={"section_count": len(project.outline)},
    )
    project.run_state.active_agents["planner-1"]["status"] = "completed"
    repository.save_project(project)

    writer_logs = []
    for idx, section in enumerate(project.outline):
        writer_log = _create_agent_log("writer", f"write_{section.code}", f"writer-{idx+1}")
        project.run_state.agent_logs.append(writer_log)
        project.run_state.active_agents[f"writer-{idx+1}"] = {"role": "writer", "section": section.title, "status": "running"}
        writer_logs.append(writer_log)
    repository.save_project(project)

    drafts_payload = await _agent_post("/internal/write-drafts", repository.get_project(project_id))
    project = repository.get_project(project_id)
    project.drafts = drafts_payload["drafts"]

    for idx, writer_log in enumerate(writer_logs):
        _update_agent_log_status(
            project,
            writer_log.id,
            "completed",
            thought_chain=["理解章节目标", "检索相关证据", "生成章节内容"],
            final_output={"section": project.outline[idx].title},
        )
        project.run_state.active_agents[f"writer-{idx+1}"]["status"] = "completed"
    repository.save_project(project)

    reviewer_logs = []
    for idx in range(2):
        reviewer_log = _create_agent_log("reviewer", f"review_{idx+1}", f"reviewer-{idx+1}")
        project.run_state.agent_logs.append(reviewer_log)
        project.run_state.active_agents[f"reviewer-{idx+1}"] = {"role": "reviewer", "perspective": "合规性" if idx == 0 else "一致性", "status": "running"}
        reviewer_logs.append(reviewer_log)
    repository.save_project(project)

    review_payload = await _agent_post("/internal/review", repository.get_project(project_id))
    project = repository.get_project(project_id)
    project.review_issues = review_payload["review_issues"]
    project.run_state.stage = ProjectStage.reviewing

    for idx, reviewer_log in enumerate(reviewer_logs):
        _update_agent_log_status(
            project,
            reviewer_log.id,
            "completed",
            thought_chain=["检查合规性", "验证一致性", "优化得分点"],
            final_output={"issues_found": len(project.review_issues)},
        )
        project.run_state.active_agents[f"reviewer-{idx+1}"]["status"] = "completed"
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

    assembler_log = _create_agent_log("assembler", "assemble_html", "assembler-1")
    project.run_state.agent_logs.append(assembler_log)
    project.run_state.active_agents["assembler-1"] = {"role": "assembler", "status": "running"}
    repository.save_project(project)
    _update_agent_log_status(project, assembler_log.id, "running")

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
    
    _update_agent_log_status(
        project,
        assembler_log.id,
        "completed",
        thought_chain=["整合内容", "图片排版", "HTML 生成"],
        final_output={"file_key": final_key},
    )
    project.run_state.active_agents["assembler-1"]["status"] = "completed"
    repository.save_project(project)

    return RunResponse(
        project_id=project_id,
        stage=project.run_state.stage,
        waiting_for_user=project.run_state.waiting_for_user,
    )
