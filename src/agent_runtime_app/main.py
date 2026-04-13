from fastapi import FastAPI

from deepbs_common.agent_logic import (
    assemble_html,
    clear_agent_logs,
    get_agent_log,
    parse_requirements,
    plan_outline,
    review_project,
    suggest_images,
    write_drafts,
)
from deepbs_common.schemas import (
    AgentExecutionLog,
    AgentRequest,
    DraftResult,
    HtmlAssembleResult,
    ImageSuggestionResult,
    OutlineResult,
    RequirementResult,
    ReviewResult,
)

app = FastAPI(title="DeepBS Agent Runtime", version="0.1.0")


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/internal/parse-tender", response_model=RequirementResult)
async def parse_tender(request: AgentRequest) -> RequirementResult:
    clear_agent_logs()
    result = parse_requirements(request.project)
    return result


@app.post("/internal/plan-outline", response_model=OutlineResult)
async def plan(request: AgentRequest) -> OutlineResult:
    clear_agent_logs()
    result = plan_outline(request.project)
    return result


@app.post("/internal/write-drafts", response_model=DraftResult)
async def write(request: AgentRequest) -> DraftResult:
    clear_agent_logs()
    result = write_drafts(request.project)
    return result


@app.post("/internal/review", response_model=ReviewResult)
async def review(request: AgentRequest) -> ReviewResult:
    clear_agent_logs()
    result = review_project(request.project)
    return result


@app.post("/internal/suggest-images", response_model=ImageSuggestionResult)
async def images(request: AgentRequest) -> ImageSuggestionResult:
    clear_agent_logs()
    result = suggest_images(request.project)
    return result


@app.post("/internal/assemble-html", response_model=HtmlAssembleResult)
async def html(request: AgentRequest) -> HtmlAssembleResult:
    clear_agent_logs()
    result = assemble_html(request.project)
    return result


@app.get("/internal/agent-log/{task_name}", response_model=AgentExecutionLog | None)
async def get_agent_execution_log(task_name: str):
    return get_agent_log(task_name)

