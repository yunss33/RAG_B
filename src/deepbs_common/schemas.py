from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class ProjectStage(str, Enum):
    created = "created"
    ingesting = "ingesting"
    planning = "planning"
    drafting = "drafting"
    reviewing = "reviewing"
    waiting_user = "waiting_user"
    assembling = "assembling"
    completed = "completed"
    failed = "failed"


class FileType(str, Enum):
    tender = "tender"
    knowledge = "knowledge"
    case = "case"
    image = "image"
    other = "other"


class ReviewIssueType(str, Enum):
    compliance = "compliance"
    consistency = "consistency"
    scoring = "scoring"


class RequirementCategory(str, Enum):
    qualification = "qualification"
    scoring = "scoring"
    rejection = "rejection"
    format = "format"
    chapter = "chapter"


class SourceFile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    file_name: str
    file_type: FileType
    object_key: str
    mime_type: str | None = None
    parse_status: str = "uploaded"
    version: int = 1
    created_at: str = Field(default_factory=utc_now)


class RequirementItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    category: RequirementCategory
    source_text: str
    normalized_text: str
    mandatory: bool = False
    risk_level: str = "medium"


class EvidenceItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    section_hint: str
    content: str
    source_file_id: str
    source_name: str
    location_hint: str
    version: int = 1
    confidence: float = 0.7


class OutlineSection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    code: str
    title: str
    goal: str
    evidence_requirements: list[str] = Field(default_factory=list)
    status: str = "planned"


class DraftSection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    outline_section_id: str
    title: str
    content: str
    evidence_ids: list[str] = Field(default_factory=list)
    missing_inputs: list[str] = Field(default_factory=list)


class ReviewIssue(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    issue_type: ReviewIssueType
    severity: str
    section_title: str
    message: str
    suggested_action: str


class ImageSuggestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    source_file_id: str
    source_name: str
    suggested_section_title: str
    usage_label: str
    placement: str
    caption: str
    preview_url: str | None = None
    selected: bool = False


class ImageSelection(BaseModel):
    suggestion_id: str
    accepted: bool
    placement: str | None = None
    layout: str | None = None


class AgentExecutionLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    agent_role: str
    agent_instance_id: str
    task_name: str
    status: str
    start_time: str | None = None
    end_time: str | None = None
    input_data: dict | None = None
    thought_chain: list[str] = Field(default_factory=list)
    intermediate_outputs: list[dict] = Field(default_factory=list)
    final_output: dict | None = None
    error_message: str | None = None


class AgentMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    from_agent: str
    to_agent: str | None = None
    message_type: str
    content: dict
    timestamp: str = Field(default_factory=utc_now)


class RunState(BaseModel):
    stage: ProjectStage = ProjectStage.created
    task_tree: list[dict[str, Any]] = Field(default_factory=list)
    retry_count: int = 0
    blocked_reason: str | None = None
    waiting_for_user: bool = False
    agent_logs: list[AgentExecutionLog] = Field(default_factory=list)
    agent_messages: list[AgentMessage] = Field(default_factory=list)
    active_agents: dict[str, dict] = Field(default_factory=dict)


class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str
    description: str | None = None
    target_language: str = "zh-CN"
    created_by: str = "admin"
    created_at: str = Field(default_factory=utc_now)
    config: dict[str, Any] = Field(default_factory=dict)
    run_state: RunState = Field(default_factory=RunState)
    source_files: list[SourceFile] = Field(default_factory=list)
    requirements: list[RequirementItem] = Field(default_factory=list)
    outline: list[OutlineSection] = Field(default_factory=list)
    evidence_items: list[EvidenceItem] = Field(default_factory=list)
    drafts: list[DraftSection] = Field(default_factory=list)
    review_issues: list[ReviewIssue] = Field(default_factory=list)
    image_suggestions: list[ImageSuggestion] = Field(default_factory=list)
    image_selections: list[ImageSelection] = Field(default_factory=list)
    final_html_object_key: str | None = None


class CreateProjectRequest(BaseModel):
    name: str
    description: str | None = None
    target_language: str = "zh-CN"


class ProjectResponse(BaseModel):
    project_id: str


class ProjectStatusResponse(BaseModel):
    project_id: str
    stage: ProjectStage
    waiting_for_user: bool
    blocked_reason: str | None
    source_file_count: int
    requirement_count: int
    draft_count: int
    review_issue_count: int
    image_suggestion_count: int
    final_html_ready: bool


class IngestResponse(BaseModel):
    project_id: str
    stage: ProjectStage
    ingested_files: int
    evidence_items: int
    image_candidates: int


class RunResponse(BaseModel):
    project_id: str
    stage: ProjectStage
    waiting_for_user: bool


class FinalHtmlResponse(BaseModel):
    project_id: str
    html: str | None = None
    url: str | None = None


class AgentRequest(BaseModel):
    project: Project


class RequirementResult(BaseModel):
    requirements: list[RequirementItem]


class OutlineResult(BaseModel):
    outline: list[OutlineSection]


class DraftResult(BaseModel):
    drafts: list[DraftSection]


class ReviewResult(BaseModel):
    review_issues: list[ReviewIssue]


class ImageSuggestionResult(BaseModel):
    image_suggestions: list[ImageSuggestion]


class HtmlAssembleResult(BaseModel):
    html: str
