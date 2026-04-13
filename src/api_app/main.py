from __future__ import annotations

from pathlib import Path
import time
import logging
from collections import defaultdict, deque

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import traceback
from prometheus_client import Counter, Histogram, Gauge, start_http_server

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("api_app.log")
    ]
)

logger = logging.getLogger("api_app")

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

# 监控指标定义
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP Requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP Request Latency', ['method', 'endpoint'])
ACTIVE_REQUESTS = Gauge('http_active_requests', 'Active HTTP Requests')
ERROR_COUNT = Counter('http_errors_total', 'Total HTTP Errors', ['method', 'endpoint', 'status'])
RATE_LIMITED_REQUESTS = Counter('http_rate_limited_requests_total', 'Total Rate Limited Requests', ['ip'])

# 限流配置
RATE_LIMIT_WINDOW = 60  # 时间窗口（秒）
RATE_LIMIT_MAX_REQUESTS = 100  # 每个时间窗口的最大请求数

# 存储每个IP的请求时间
ip_requests = defaultdict(lambda: deque(maxlen=RATE_LIMIT_MAX_REQUESTS))

app = FastAPI(
    title="DeepBS API Gateway", 
    version="0.1.0",
    description="DeepBS项目管理和文档处理API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 启动Prometheus metrics服务器
start_http_server(8000)

# 限流中间件
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # 获取客户端IP
    client_ip = request.client.host if request.client else "unknown"
    
    # 清理过期的请求记录
    current_time = time.time()
    window_start = current_time - RATE_LIMIT_WINDOW
    
    # 移除时间窗口外的请求
    while ip_requests[client_ip] and ip_requests[client_ip][0] < window_start:
        ip_requests[client_ip].popleft()
    
    # 检查是否超过限流阈值
    if len(ip_requests[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        RATE_LIMITED_REQUESTS.labels(ip=client_ip).inc()
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Please try again later."}
        )
    
    # 记录本次请求
    ip_requests[client_ip].append(current_time)
    
    # 执行请求
    response = await call_next(request)
    
    return response

# 监控中间件
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    # 增加活跃请求计数
    ACTIVE_REQUESTS.inc()
    
    # 记录请求开始时间
    start_time = time.time()
    
    # 执行请求
    response = await call_next(request)
    
    # 计算请求处理时间
    processing_time = time.time() - start_time
    
    # 记录请求指标
    endpoint = request.url.path
    method = request.method
    status = response.status_code
    
    REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=status).inc()
    REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(processing_time)
    
    # 如果是错误状态码，增加错误计数
    if status >= 400:
        ERROR_COUNT.labels(method=method, endpoint=endpoint, status=status).inc()
    
    # 减少活跃请求计数
    ACTIVE_REQUESTS.dec()
    
    return response

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局异常处理中间件
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # 记录异常堆栈
    logger.error(f"Unhandled exception: {exc}")
    logger.error(traceback.format_exc())
    
    # 返回500错误响应
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)}
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
async def healthz() -> dict:
    """健康检查接口，包括服务依赖检查"""
    logger.info("Health check requested")
    health_status = {"status": "ok", "dependencies": {}}
    
    # 检查存储服务
    try:
        # 尝试读取存储目录
        if Path(settings.object_dir).exists():
            health_status["dependencies"]["storage"] = "ok"
            logger.info("Storage service is healthy")
        else:
            health_status["dependencies"]["storage"] = "error: storage directory not found"
            health_status["status"] = "degraded"
            logger.warning("Storage service is degraded: directory not found")
    except Exception as e:
        health_status["dependencies"]["storage"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
        logger.error(f"Storage service check failed: {str(e)}")
    
    # 检查RAG服务
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(f"{settings.rag_service_base_url}/healthz")
            if response.status_code == 200:
                health_status["dependencies"]["rag_service"] = "ok"
                logger.info("RAG service is healthy")
            else:
                health_status["dependencies"]["rag_service"] = f"error: status code {response.status_code}"
                health_status["status"] = "degraded"
                logger.warning(f"RAG service is degraded: status code {response.status_code}")
    except Exception as e:
        health_status["dependencies"]["rag_service"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
        logger.error(f"RAG service check failed: {str(e)}")
    
    # 检查Orchestrator服务
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(f"{settings.orchestrator_base_url}/healthz")
            if response.status_code == 200:
                health_status["dependencies"]["orchestrator"] = "ok"
                logger.info("Orchestrator service is healthy")
            else:
                health_status["dependencies"]["orchestrator"] = f"error: status code {response.status_code}"
                health_status["status"] = "degraded"
                logger.warning(f"Orchestrator service is degraded: status code {response.status_code}")
    except Exception as e:
        health_status["dependencies"]["orchestrator"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
        logger.error(f"Orchestrator service check failed: {str(e)}")
    
    logger.info(f"Health check completed with status: {health_status['status']}")
    return health_status


@app.get("/projects")
async def list_projects() -> list[Project]:
    """获取项目列表"""
    return repository.list_projects()


@app.get("/projects/{project_id}")
async def get_project(project_id: str) -> Project:
    """获取项目详情"""
    try:
        return repository.get_project(project_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc


@app.post("/projects", response_model=ProjectResponse)
async def create_project(payload: CreateProjectRequest) -> ProjectResponse:
    """创建新项目"""
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
    """上传文件到项目
    
    Args:
        project_id: 项目ID
        file: 要上传的文件
        file_type: 文件类型 (tender, knowledge, case, image, other)
    
    Returns:
        SourceFile: 上传的文件信息
    """
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
    """处理项目文件，进行文档分块和向量生成
    
    Args:
        project_id: 项目ID
    
    Returns:
        IngestResponse: 处理结果，包括处理的文件数、证据项数和图片候选数
    
    Raises:
        HTTPException: 当项目不存在或没有文件可处理时
    """
    try:
        project = repository.get_project(project_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc

    # 检查是否有文件可以处理
    if not project.source_files:
        raise HTTPException(status_code=400, detail="project has no source files to ingest")

    project.run_state.stage = ProjectStage.ingesting
    project.run_state.waiting_for_user = False
    project.run_state.blocked_reason = None
    repository.save_project(project)

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(f"{settings.rag_service_base_url}/internal/projects/{project_id}/ingest")
            response.raise_for_status()
            payload = response.json()
    except httpx.RequestError as exc:
        project.run_state.stage = ProjectStage.failed
        project.run_state.blocked_reason = f"RAG service error: {str(exc)}"
        repository.save_project(project)
        raise HTTPException(status_code=500, detail=f"Ingest failed: {str(exc)}") from exc
    except httpx.HTTPStatusError as exc:
        project.run_state.stage = ProjectStage.failed
        project.run_state.blocked_reason = f"RAG service returned error: {exc.response.text}"
        repository.save_project(project)
        raise HTTPException(status_code=exc.response.status_code, detail=f"Ingest failed: {exc.response.text}") from exc

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


@app.post("/projects/{project_id}/search")
async def search_project_vectors(
    project_id: str, 
    query: str, 
    limit: int = 5,
    type: str = "all",  # 搜索类型: document_chunk, evidence_item, all
    threshold: float = 0.0,  # 相似度阈值
    file_type: str | None = None  # 按文件类型过滤
):
    """搜索项目文档向量
    
    Args:
        project_id: 项目ID
        query: 搜索查询文本
        limit: 返回结果数量限制，默认5
        type: 搜索类型 (all, document_chunk, evidence_item)，默认all
        threshold: 相似度阈值，默认0.0
        file_type: 按文件类型过滤，可选
    
    Returns:
        dict: 搜索结果，包含匹配的文档分块和证据项
    """
    try:
        repository.get_project(project_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{settings.rag_service_base_url}/internal/projects/{project_id}/search",
            json={
                "query": query, 
                "limit": limit,
                "type": type,
                "threshold": threshold,
                "file_type": file_type
            }
        )
        response.raise_for_status()
        payload = response.json()
    return payload


@app.get("/objects/{object_key}")
async def serve_object(object_key: str):
    path = Path(settings.object_dir) / object_key
    if not path.exists():
        raise HTTPException(status_code=404, detail="object not found")
    return FileResponse(path)
