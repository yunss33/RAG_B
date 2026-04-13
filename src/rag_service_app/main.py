from __future__ import annotations

from pathlib import Path
import time
import logging
from collections import defaultdict, deque

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from qdrant_client.http.models import PointStruct
import traceback
from prometheus_client import Counter, Histogram, Gauge, start_http_server

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("rag_service_app.log")
    ]
)

logger = logging.getLogger("rag_service_app")

from deepbs_common.repository import repository
from deepbs_common.schemas import DocumentChunk, EvidenceItem, FileType, IngestResponse, ProjectStage
from deepbs_common.storage import storage
from deepbs_common.settings import settings

# 仅在启用RAG时导入相关模块
if settings.enable_rag:
    from deepbs_common.chunking import document_chunker
    from deepbs_common.embedding import embedding_manager
    from deepbs_common.qdrant import qdrant_manager
    logger.info("RAG功能已启用")
else:
    logger.info("RAG功能已禁用")

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

app = FastAPI(title="DeepBS RAG Service", version="0.1.0")

# 启动Prometheus metrics服务器
start_http_server(8001)

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


def _extract_text_for_file(object_key: str, fallback_name: str) -> str:
    text = storage.read_text(object_key).strip()
    if text:
        return text
    suffix = Path(object_key).suffix.lower()
    return f"{fallback_name} 的内容暂未做深入解析。当前作为 {suffix or '通用'} 资料导入，可在后续接入 OCR 或文档解析器。"


@app.get("/healthz")
async def healthz() -> dict:
    """健康检查接口，包括服务依赖检查"""
    logger.info("Health check requested")
    health_status = {"status": "ok", "dependencies": {}}
    
    # 检查存储服务
    try:
        from deepbs_common.settings import settings
        from pathlib import Path
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
    
    # 仅在启用RAG时检查Qdrant和embedding服务
    if settings.enable_rag:
        # 检查Qdrant服务
        try:
            # 尝试创建集合或检查连接
            qdrant_manager.create_collection()
            health_status["dependencies"]["qdrant"] = "ok"
            logger.info("Qdrant service is healthy")
        except Exception as e:
            health_status["dependencies"]["qdrant"] = f"error: {str(e)}"
            health_status["status"] = "degraded"
            logger.error(f"Qdrant service check failed: {str(e)}")
        
        # 检查embedding服务
        try:
            # 尝试生成一个简单的嵌入
            test_vector = embedding_manager.get_embedding("test")
            if test_vector and len(test_vector) > 0:
                health_status["dependencies"]["embedding"] = "ok"
                logger.info("Embedding service is healthy")
            else:
                health_status["dependencies"]["embedding"] = "error: embedding service returned empty vector"
                health_status["status"] = "degraded"
                logger.warning("Embedding service is degraded: returned empty vector")
        except Exception as e:
            health_status["dependencies"]["embedding"] = f"error: {str(e)}"
            health_status["status"] = "degraded"
            logger.error(f"Embedding service check failed: {str(e)}")
    else:
        health_status["dependencies"]["rag"] = "disabled"
        logger.info("RAG functionality is disabled")
    
    logger.info(f"Health check completed with status: {health_status['status']}")
    return health_status


@app.post("/internal/projects/{project_id}/ingest", response_model=IngestResponse)
async def ingest_project(project_id: str) -> IngestResponse:
    try:
        project = repository.get_project(project_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="project not found") from exc

    project.run_state.stage = ProjectStage.ingesting
    project.run_state.blocked_reason = None
    repository.save_project(project)

    evidence_items: list[EvidenceItem] = []
    document_chunks: list[DocumentChunk] = []
    image_candidates = 0
    qdrant_points = []

    if settings.enable_rag:
        qdrant_available = False
        try:
            # 尝试初始化Qdrant集合
            qdrant_manager.create_collection()
            qdrant_available = True
            logger.info("Qdrant is available, using vector database")
        except Exception as e:
            logger.warning(f"Qdrant not available: {e}, using local storage only")
            qdrant_available = False

        for source in project.source_files:
                try:
                    source.parse_status = "processing"
                    if source.file_type == FileType.image:
                        image_candidates += 1
                        # 处理图片文件，提取文本内容
                        content = _extract_text_for_file(source.object_key, source.file_name)
                        
                        # 为图片创建证据项
                        hints = ["项目理解与总体响应", "技术方案与实施路径", "项目组织与服务保障", "资质、案例与附录"]
                        for index, hint in enumerate(hints):
                            # 为证据项生成向量
                            evidence_content = f"{source.file_name} 提供的支撑信息 {index + 1}: {content[:160]}"
                            evidence_vector = embedding_manager.get_embedding(evidence_content)
                            
                            evidence_item = EvidenceItem(
                                section_hint=hint,
                                content=evidence_content,
                                source_file_id=source.id,
                                source_name=source.file_name,
                                location_hint=f"image-content",
                                page_number=index + 1,
                                confidence=0.65 + (index * 0.05),
                                vector=evidence_vector
                            )
                            evidence_items.append(evidence_item)
                            
                            # 创建Qdrant点
                            point = PointStruct(
                                id=f"{project_id}_{source.id}_evidence_{index}",
                                vector=evidence_vector,
                                payload={
                                    "project_id": project_id,
                                    "source_file_id": source.id,
                                    "source_name": source.file_name,
                                    "content": evidence_content,
                                    "section_hint": hint,
                                    "location_hint": f"image-content",
                                    "page_number": index + 1,
                                    "confidence": 0.65 + (index * 0.05),
                                    "type": "evidence_item"
                                }
                            )
                            qdrant_points.append(point)
                        source.parse_status = "indexed"
                        continue

                    content = _extract_text_for_file(source.object_key, source.file_name)
                    
                    # 文档分块
                    chunks_with_positions = document_chunker.chunk_with_overlap(content)
                    
                    # 提取分块文本
                    chunk_texts = [chunk[0] for chunk in chunks_with_positions]
                    
                    # 批量生成向量
                    if chunk_texts:
                        vectors = embedding_manager.get_embeddings(chunk_texts)
                    else:
                        vectors = []
                    
                    # 创建文档分块
                    for i, ((chunk_text, start_pos, end_pos), vector) in enumerate(zip(chunks_with_positions, vectors)):
                        chunk = DocumentChunk(
                            source_file_id=source.id,
                            source_name=source.file_name,
                            content=chunk_text,
                            start_pos=start_pos,
                            end_pos=end_pos,
                            vector=vector
                        )
                        document_chunks.append(chunk)
                        
                        # 创建Qdrant点
                        point = PointStruct(
                            id=f"{project_id}_{source.id}_chunk_{i}",
                            vector=vector,
                            payload={
                                "project_id": project_id,
                                "source_file_id": source.id,
                                "source_name": source.file_name,
                                "content": chunk_text,
                                "start_pos": start_pos,
                                "end_pos": end_pos,
                                "type": "document_chunk"
                            }
                        )
                        qdrant_points.append(point)
                    
                    # 创建证据项
                    hints = ["项目理解与总体响应", "技术方案与实施路径", "项目组织与服务保障", "资质、案例与附录"]
                    for index, hint in enumerate(hints):
                        # 为证据项生成向量
                        evidence_content = f"{source.file_name} 提供的支撑信息 {index + 1}: {content[:160]}"
                        evidence_vector = embedding_manager.get_embedding(evidence_content)
                        
                        evidence_item = EvidenceItem(
                            section_hint=hint,
                            content=evidence_content,
                            source_file_id=source.id,
                            source_name=source.file_name,
                            location_hint=f"chunk-{index + 1}",
                            chunk_id=f"{project_id}_{source.id}_chunk_{index}" if index < len(chunks_with_positions) else None,
                            start_pos=chunks_with_positions[index][1] if index < len(chunks_with_positions) else None,
                            end_pos=chunks_with_positions[index][2] if index < len(chunks_with_positions) else None,
                            page_number=index + 1,
                            confidence=0.65 + (index * 0.05),
                            vector=evidence_vector
                        )
                        evidence_items.append(evidence_item)
                        
                        # 只有在Qdrant可用时才添加Qdrant点
                        if qdrant_available:
                            point = PointStruct(
                                id=f"{project_id}_{source.id}_evidence_{index}",
                                vector=evidence_vector,
                                payload={
                                    "project_id": project_id,
                                    "source_file_id": source.id,
                                    "source_name": source.file_name,
                                    "content": evidence_content,
                                    "section_hint": hint,
                                    "location_hint": f"chunk-{index + 1}",
                                    "chunk_id": f"{project_id}_{source.id}_chunk_{index}" if index < len(chunks_with_positions) else None,
                                    "start_pos": chunks_with_positions[index][1] if index < len(chunks_with_positions) else None,
                                    "end_pos": chunks_with_positions[index][2] if index < len(chunks_with_positions) else None,
                                    "page_number": index + 1,
                                    "confidence": 0.65 + (index * 0.05),
                                    "type": "evidence_item"
                                }
                            )
                            qdrant_points.append(point)
                    
                    source.parse_status = "indexed"
                except Exception as e:
                    source.parse_status = f"error: {str(e)}"
                    continue

            # 只有在Qdrant可用时才存储向量到Qdrant
            if qdrant_available and qdrant_points:
                try:
                    qdrant_manager.upsert_vectors(qdrant_points)
                    logger.info(f"Successfully upserted {len(qdrant_points)} vectors to Qdrant")
                except Exception as e:
                    logger.warning(f"Failed to store vectors to Qdrant: {e}, continuing with local storage only")
    else:
        # RAG功能禁用时，生成模拟证据项
        for source in project.source_files:
            try:
                source.parse_status = "processing"
                if source.file_type == FileType.image:
                    image_candidates += 1
                
                # 生成模拟证据项
                hints = ["项目理解与总体响应", "技术方案与实施路径", "项目组织与服务保障", "资质、案例与附录"]
                for index, hint in enumerate(hints):
                    evidence_item = EvidenceItem(
                        section_hint=hint,
                        content=f"{source.file_name} 提供的支撑信息 {index + 1}: 这是模拟的证据内容",
                        source_file_id=source.id,
                        source_name=source.file_name,
                        location_hint=f"mock-location-{index + 1}",
                        page_number=index + 1,
                        confidence=0.8,
                        vector=[0.0] * 1024  # 模拟向量
                    )
                    evidence_items.append(evidence_item)
                
                source.parse_status = "indexed"
            except Exception as e:
                source.parse_status = f"error: {str(e)}"
                continue
        logger.info(f"RAG功能禁用，生成 {len(evidence_items)} 个模拟证据项")

    project.evidence_items = evidence_items
    project.document_chunks = document_chunks
    project.run_state.stage = ProjectStage.created
    repository.save_project(project)
    return IngestResponse(
        project_id=project_id,
        stage=project.run_state.stage,
        ingested_files=len([f for f in project.source_files if f.parse_status == "indexed"]),
        evidence_items=len(evidence_items),
        image_candidates=image_candidates,
    )
    except Exception as e:
        project.run_state.stage = ProjectStage.failed
        project.run_state.blocked_reason = f"Ingest error: {str(e)}"
        repository.save_project(project)
        raise HTTPException(status_code=500, detail=f"Ingest failed: {str(e)}") from e


@app.post("/internal/projects/{project_id}/search")
async def search_vectors(
    project_id: str, 
    query: str, 
    limit: int = 5,
    type: str = "all",  # 搜索类型: document_chunk, evidence_item, all
    threshold: float = 0.0,  # 相似度阈值
    file_type: str | None = None  # 按文件类型过滤
):
    """搜索文档向量"""
    if settings.enable_rag:
        try:
            # 生成查询向量
            query_vector = embedding_manager.get_embedding(query)
            
            # 构建过滤条件
            filter_conditions = {
                "must": [
                    {"key": "project_id", "match": {"value": project_id}}
                ]
            }
            
            # 添加类型过滤
            if type != "all":
                filter_conditions["must"].append({
                    "key": "type", "match": {"value": type}
                })
            
            # 搜索向量
            results = qdrant_manager.search_vectors(
                query_vector=query_vector,
                limit=limit,
                filter_conditions=filter_conditions
            )
            
            # 格式化结果并应用阈值
            formatted_results = []
            for result in results:
                if result.score >= threshold:
                    formatted_results.append({
                        "score": result.score,
                        "id": result.id,
                        "payload": result.payload,
                        "type": result.payload.get("type", "unknown")
                    })
            
            # 按相似度分数降序排序
            formatted_results.sort(key=lambda x: x["score"], reverse=True)
            
            return {"results": formatted_results, "status": "success"}
        except Exception as e:
            # 当Qdrant服务不可用时，尝试从本地项目数据中搜索
            try:
                project = repository.get_project(project_id)
                
                # 收集所有文档分块和证据项
                all_items = []
                
                # 添加文档分块
                if type == "all" or type == "document_chunk":
                    for chunk in project.document_chunks:
                        all_items.append({
                            "id": f"{project_id}_{chunk.source_file_id}_chunk_{chunk.start_pos}",
                            "score": 0.0,  # 本地计算相似度
                            "payload": {
                                "project_id": project_id,
                                "source_file_id": chunk.source_file_id,
                                "source_name": chunk.source_name,
                                "content": chunk.content,
                                "start_pos": chunk.start_pos,
                                "end_pos": chunk.end_pos,
                                "type": "document_chunk"
                            },
                            "vector": chunk.vector,
                            "type": "document_chunk"
                        })
                
                # 添加证据项
                if type == "all" or type == "evidence_item":
                    for evidence in project.evidence_items:
                        all_items.append({
                            "id": f"{project_id}_{evidence.source_file_id}_evidence_{evidence.section_hint}",
                            "score": 0.0,  # 本地计算相似度
                            "payload": {
                                "project_id": project_id,
                                "source_file_id": evidence.source_file_id,
                                "source_name": evidence.source_name,
                                "content": evidence.content,
                                "section_hint": evidence.section_hint,
                                "location_hint": evidence.location_hint,
                                "chunk_id": evidence.chunk_id,
                                "start_pos": evidence.start_pos,
                                "end_pos": evidence.end_pos,
                                "page_number": evidence.page_number,
                                "confidence": evidence.confidence,
                                "type": "evidence_item"
                            },
                            "vector": evidence.vector,
                            "type": "evidence_item"
                        })
                
                # 计算余弦相似度
                query_vector = embedding_manager.get_embedding(query)
                
                def cosine_similarity(v1, v2):
                    import math
                    dot_product = sum(a * b for a, b in zip(v1, v2))
                    magnitude1 = math.sqrt(sum(a * a for a in v1))
                    magnitude2 = math.sqrt(sum(a * a for a in v2))
                    if magnitude1 == 0 or magnitude2 == 0:
                        return 0.0
                    return dot_product / (magnitude1 * magnitude2)
                
                # 计算每个项的相似度
                for item in all_items:
                    item["score"] = cosine_similarity(query_vector, item["vector"])
                
                # 应用阈值过滤
                filtered_items = [item for item in all_items if item["score"] >= threshold]
                
                # 按相似度排序并限制数量
                filtered_items.sort(key=lambda x: x["score"], reverse=True)
                local_results = filtered_items[:limit]
                
                # 移除向量字段（避免返回大量数据）
                for item in local_results:
                    item.pop("vector", None)
                
                return {"results": local_results, "status": "success", "mode": "local"}
            except Exception as local_e:
                return {"results": [], "status": "error", "message": f"Search failed: {str(local_e)}"}
    else:
        # RAG功能禁用时，返回模拟搜索结果
        try:
            project = repository.get_project(project_id)
            
            # 收集所有证据项
            all_items = []
            
            # 添加证据项
            if type == "all" or type == "evidence_item":
                for evidence in project.evidence_items[:limit]:
                    all_items.append({
                        "id": f"mock_{evidence.source_file_id}_{evidence.section_hint}",
                        "score": 0.85,  # 模拟相似度分数
                        "payload": {
                            "project_id": project_id,
                            "source_file_id": evidence.source_file_id,
                            "source_name": evidence.source_name,
                            "content": evidence.content,
                            "section_hint": evidence.section_hint,
                            "location_hint": evidence.location_hint,
                            "page_number": evidence.page_number,
                            "confidence": evidence.confidence,
                            "type": "evidence_item"
                        },
                        "type": "evidence_item"
                    })
            
            return {"results": all_items, "status": "success", "mode": "mock"}
        except Exception as e:
            return {"results": [], "status": "error", "message": f"Search failed: {str(e)}"}


