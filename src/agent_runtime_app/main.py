from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import traceback
import time
import logging
from collections import defaultdict, deque
from prometheus_client import Counter, Histogram, Gauge, start_http_server

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("agent_runtime_app.log")
    ]
)

logger = logging.getLogger("agent_runtime_app")

from deepbs_common.langgraph_workflow import run_agent_workflow
from deepbs_common.agent_logic import (
    clear_agent_logs,
    get_agent_log,
)
from deepbs_common.skill_system import skill_manager
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

app = FastAPI(title="DeepBS Agent Runtime", version="0.1.0")

# 启动Prometheus metrics服务器
start_http_server(8003)

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


@app.get("/healthz")
async def healthz() -> dict:
    """健康检查接口，包括服务功能检查"""
    logger.info("Health check requested")
    health_status = {"status": "ok", "dependencies": {}}
    
    # 检查agent_logic模块是否正常
    try:
        # 尝试清除agent日志，验证模块是否正常加载
        clear_agent_logs()
        health_status["dependencies"]["agent_logic"] = "ok"
        logger.info("Agent logic module is healthy")
    except Exception as e:
        health_status["dependencies"]["agent_logic"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
        logger.error(f"Agent logic module check failed: {str(e)}")
    
    logger.info(f"Health check completed with status: {health_status['status']}")
    return health_status


@app.post("/internal/parse-tender", response_model=RequirementResult)
async def parse_tender(request: AgentRequest) -> RequirementResult:
    clear_agent_logs()
    result = await run_agent_workflow(request.project, "parse")
    return result


@app.post("/internal/plan-outline", response_model=OutlineResult)
async def plan(request: AgentRequest) -> OutlineResult:
    clear_agent_logs()
    result = await run_agent_workflow(request.project, "plan")
    return result


@app.post("/internal/write-drafts", response_model=DraftResult)
async def write(request: AgentRequest) -> DraftResult:
    clear_agent_logs()
    result = await run_agent_workflow(request.project, "write")
    return result


@app.post("/internal/review", response_model=ReviewResult)
async def review(request: AgentRequest) -> ReviewResult:
    clear_agent_logs()
    result = await run_agent_workflow(request.project, "review")
    return result


@app.post("/internal/suggest-images", response_model=ImageSuggestionResult)
async def images(request: AgentRequest) -> ImageSuggestionResult:
    clear_agent_logs()
    result = await run_agent_workflow(request.project, "images")
    return result


@app.post("/internal/assemble-html", response_model=HtmlAssembleResult)
async def html(request: AgentRequest) -> HtmlAssembleResult:
    clear_agent_logs()
    result = await run_agent_workflow(request.project, "assemble")
    return result


@app.get("/internal/agent-log/{task_name}", response_model=AgentExecutionLog | None)
async def get_agent_execution_log(task_name: str):
    return get_agent_log(task_name)


@app.get("/internal/skills")
async def get_available_skills():
    """获取所有可用技能"""
    skills = skill_manager.get_available_skills()
    return {
        "skills": [
            {
                "name": skill.name,
                "description": skill.description,
                "category": skill.category,
                "dependencies": skill.dependencies
            }
            for skill in skills
        ]
    }


@app.post("/internal/skills/recommend")
async def recommend_skills(request: AgentRequest):
    """推荐适合的技能组合"""
    recommendations = skill_manager.recommend_skills(request.project)
    return {"recommendations": recommendations}


@app.post("/internal/skills/execute/{skill_name}")
async def execute_skill(skill_name: str, request: AgentRequest):
    """执行指定技能"""
    try:
        result = await skill_manager.execute_skill(skill_name, request.project, {})
        return {"result": result["result"]}
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": str(e)}
        )


@app.post("/internal/outline/confirm")
async def confirm_outline(request: AgentRequest):
    """确认项目大纲"""
    try:
        project = request.project
        
        # 确认整个项目的大纲
        project.outline_confirmed = True
        
        # 确认所有章节大纲
        for section in project.outline:
            section.confirmed = True
        
        return {"status": "success", "message": "大纲确认成功"}
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": str(e)}
        )


@app.post("/internal/outline/confirm-section/{section_id}")
async def confirm_outline_section(section_id: str, request: AgentRequest):
    """确认单个章节大纲"""
    try:
        project = request.project
        
        # 查找并确认指定章节
        section_found = False
        for section in project.outline:
            if section.id == section_id:
                section.confirmed = True
                section_found = True
                break
        
        if not section_found:
            return JSONResponse(
                status_code=404,
                content={"error": f"章节ID {section_id} 不存在"}
            )
        
        # 检查是否所有章节都已确认
        all_confirmed = all(section.confirmed for section in project.outline)
        if all_confirmed:
            project.outline_confirmed = True
        
        return {"status": "success", "message": "章节大纲确认成功"}
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": str(e)}
        )


@app.post("/internal/answer-questions")
async def answer_questions(request: dict):
    """处理用户对问题的回答"""
    try:
        project = request.get("project")
        answers = request.get("answers", [])
        
        if not project:
            return JSONResponse(
                status_code=400,
                content={"error": "项目信息缺失"}
            )
        
        # 处理每个回答
        for answer in answers:
            question_id = answer.get("question_id")
            response = answer.get("response")
            question_type = answer.get("question_type")
            
            if question_type == "section_confirmation":
                # 处理章节确认
                if response == "确认":
                    # 查找并确认章节
                    for section in project.get("outline", []):
                        if section.get("id") == question_id:
                            section["confirmed"] = True
                            break
                elif response == "修改":
                    # 标记章节需要修改
                    for section in project.get("outline", []):
                        if section.get("id") == question_id:
                            section["status"] = "needs_modification"
                            break
                elif response == "删除":
                    # 从大纲中移除章节
                    project["outline"] = [
                        section for section in project.get("outline", [])
                        if section.get("id") != question_id
                    ]
            
            elif question_type == "image_insertion":
                # 处理图片插入决策
                if response == "是":
                    project["config"]["enable_image_insertion"] = True
                else:
                    project["config"]["enable_image_insertion"] = False
            
            elif question_type == "rag_source":
                # 处理RAG信息来源决策
                if response == "是":
                    project["config"]["enable_rag"] = True
                else:
                    project["config"]["enable_rag"] = False
        
        # 检查是否所有章节都已确认
        if project.get("outline"):
            all_confirmed = all(section.get("confirmed", False) for section in project["outline"])
            if all_confirmed:
                project["outline_confirmed"] = True
        
        return {"status": "success", "message": "问题回答处理成功", "project": project}
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": str(e)}
        )

