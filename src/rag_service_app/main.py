from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException

from deepbs_common.repository import repository
from deepbs_common.schemas import EvidenceItem, FileType, IngestResponse, ProjectStage
from deepbs_common.storage import storage

app = FastAPI(title="DeepBS RAG Service", version="0.1.0")


def _extract_text_for_file(object_key: str, fallback_name: str) -> str:
    text = storage.read_text(object_key).strip()
    if text:
        return text[:500]
    suffix = Path(object_key).suffix.lower()
    return f"{fallback_name} 的内容暂未做深入解析。当前作为 {suffix or '通用'} 资料导入，可在后续接入 OCR 或文档解析器。"


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/internal/projects/{project_id}/ingest", response_model=IngestResponse)
async def ingest_project(project_id: str) -> IngestResponse:
    try:
        project = repository.get_project(project_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc

    project.run_state.stage = ProjectStage.ingesting
    evidence_items: list[EvidenceItem] = []
    image_candidates = 0

    for source in project.source_files:
        source.parse_status = "indexed"
        if source.file_type == FileType.image:
            image_candidates += 1
            continue

        content = _extract_text_for_file(source.object_key, source.file_name)
        hints = ["项目理解与总体响应", "技术方案与实施路径", "项目组织与服务保障", "资质、案例与附录"]
        for index, hint in enumerate(hints):
            evidence_items.append(
                EvidenceItem(
                    section_hint=hint,
                    content=f"{source.file_name} 提供的支撑信息 {index + 1}: {content[:160]}",
                    source_file_id=source.id,
                    source_name=source.file_name,
                    location_hint=f"chunk-{index + 1}",
                    confidence=0.65 + (index * 0.05),
                )
            )

    project.evidence_items = evidence_items
    project.run_state.stage = ProjectStage.created
    repository.save_project(project)
    return IngestResponse(
        project_id=project_id,
        stage=project.run_state.stage,
        ingested_files=len(project.source_files),
        evidence_items=len(evidence_items),
        image_candidates=image_candidates,
    )

