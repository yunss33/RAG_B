from fastapi import FastAPI

from deepbs_common.agent_logic import (
    assemble_html,
    parse_requirements,
    plan_outline,
    review_project,
    suggest_images,
    write_drafts,
)
from deepbs_common.schemas import (
    AgentRequest,
    DraftResult,
    HtmlAssembleResult,
    ImageSuggestionResult,
    OutlineResult,
    RequirementResult,
    ReviewResult,
)
from deepbs_common.skill_loader import skill_loader

# 加载Superpowers Plus技能
superpowers_plus_content = skill_loader.load_superpowers_plus(compressed=True)
if superpowers_plus_content:
    print("Successfully loaded Superpowers Plus skill (compressed version)")
else:
    print("Superpowers Plus skill not found, trying regular version...")
    superpowers_plus_content = skill_loader.load_superpowers_plus(compressed=False)
    if superpowers_plus_content:
        print("Successfully loaded Superpowers Plus skill (regular version)")
    else:
        print("Warning: Superpowers Plus skill not available")

app = FastAPI(title="DeepBS Agent Runtime", version="0.1.0")


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/internal/parse-tender", response_model=RequirementResult)
async def parse_tender(request: AgentRequest) -> RequirementResult:
    return parse_requirements(request.project)


@app.post("/internal/plan-outline", response_model=OutlineResult)
async def plan(request: AgentRequest) -> OutlineResult:
    return plan_outline(request.project)


@app.post("/internal/write-drafts", response_model=DraftResult)
async def write(request: AgentRequest) -> DraftResult:
    return write_drafts(request.project)


@app.post("/internal/review", response_model=ReviewResult)
async def review(request: AgentRequest) -> ReviewResult:
    return review_project(request.project)


@app.post("/internal/suggest-images", response_model=ImageSuggestionResult)
async def images(request: AgentRequest) -> ImageSuggestionResult:
    return suggest_images(request.project)


@app.post("/internal/assemble-html", response_model=HtmlAssembleResult)
async def html(request: AgentRequest) -> HtmlAssembleResult:
    return assemble_html(request.project)


@app.get("/internal/skills/superpowers-plus")
async def get_superpowers_plus() -> dict[str, str]:
    """获取Superpowers Plus技能内容"""
    content = skill_loader.load_superpowers_plus(compressed=True)
    if not content:
        content = skill_loader.load_superpowers_plus(compressed=False)
    return {"content": content or "Superpowers Plus skill not available"}

