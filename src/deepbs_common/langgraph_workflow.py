from __future__ import annotations

from typing import TypedDict, Optional, List, Dict, Any
from langgraph.graph import StateGraph, END

from .schemas import (
    Project, RequirementResult, OutlineResult, DraftResult, ReviewResult, 
    ImageSuggestionResult, HtmlAssembleResult, AgentExecutionLog, utc_now
)
from .agent_logic import (
    parse_requirements, plan_outline, write_drafts, review_project, 
    suggest_images, assemble_html
)


class AgentState(TypedDict):
    """Agent工作流状态"""
    project: Project
    task: str
    result: Optional[Any] = None
    agent_logs: List[AgentExecutionLog] = []
    current_log: Optional[AgentExecutionLog] = None
    error: Optional[str] = None


def parse_requirements_node(state: AgentState) -> Dict[str, Any]:
    """解析招标文件节点"""
    project = state["project"]
    
    # 创建执行日志
    log = AgentExecutionLog(
        agent_role="parser",
        agent_instance_id="parser-1",
        task_name="parse_requirements",
        status="running",
        start_time=utc_now(),
        thought_chain=[],
        intermediate_outputs=[]
    )
    
    try:
        result = parse_requirements(project, log)
        log.status = "completed"
        log.end_time = utc_now()
        log.final_output = result.model_dump() if hasattr(result, 'model_dump') else dict(result)
        
        # 更新项目
        project.requirements = result.requirements
        
        return {
            "project": project,
            "result": result,
            "agent_logs": state["agent_logs"] + [log],
            "current_log": log,
            "error": None
        }
    except Exception as e:
        log.status = "failed"
        log.end_time = utc_now()
        log.error_message = str(e)
        
        return {
            "project": project,
            "result": None,
            "agent_logs": state["agent_logs"] + [log],
            "current_log": log,
            "error": str(e)
        }


def plan_outline_node(state: AgentState) -> Dict[str, Any]:
    """规划大纲节点"""
    project = state["project"]
    
    # 创建执行日志
    log = AgentExecutionLog(
        agent_role="planner",
        agent_instance_id="planner-1",
        task_name="plan_outline",
        status="running",
        start_time=utc_now(),
        thought_chain=[],
        intermediate_outputs=[]
    )
    
    try:
        result = plan_outline(project, log)
        log.status = "completed"
        log.end_time = utc_now()
        log.final_output = result.model_dump() if hasattr(result, 'model_dump') else dict(result)
        
        # 更新项目
        project.outline = result.outline
        
        return {
            "project": project,
            "result": result,
            "agent_logs": state["agent_logs"] + [log],
            "current_log": log,
            "error": None
        }
    except Exception as e:
        log.status = "failed"
        log.end_time = utc_now()
        log.error_message = str(e)
        
        return {
            "project": project,
            "result": None,
            "agent_logs": state["agent_logs"] + [log],
            "current_log": log,
            "error": str(e)
        }


def write_drafts_node(state: AgentState) -> Dict[str, Any]:
    """撰写草稿节点"""
    project = state["project"]
    
    # 创建执行日志
    log = AgentExecutionLog(
        agent_role="writer",
        agent_instance_id="writer-1",
        task_name="write_drafts",
        status="running",
        start_time=utc_now(),
        thought_chain=[],
        intermediate_outputs=[]
    )
    
    try:
        result = write_drafts(project, log)
        log.status = "completed"
        log.end_time = utc_now()
        log.final_output = result.model_dump() if hasattr(result, 'model_dump') else dict(result)
        
        # 更新项目
        project.drafts = result.drafts
        
        return {
            "project": project,
            "result": result,
            "agent_logs": state["agent_logs"] + [log],
            "current_log": log,
            "error": None
        }
    except Exception as e:
        log.status = "failed"
        log.end_time = utc_now()
        log.error_message = str(e)
        
        return {
            "project": project,
            "result": None,
            "agent_logs": state["agent_logs"] + [log],
            "current_log": log,
            "error": str(e)
        }


def review_project_node(state: AgentState) -> Dict[str, Any]:
    """审查项目节点"""
    project = state["project"]
    
    # 创建执行日志
    log = AgentExecutionLog(
        agent_role="reviewer",
        agent_instance_id="reviewer-1",
        task_name="review_project",
        status="running",
        start_time=utc_now(),
        thought_chain=[],
        intermediate_outputs=[]
    )
    
    try:
        result = review_project(project, log)
        log.status = "completed"
        log.end_time = utc_now()
        log.final_output = result.model_dump() if hasattr(result, 'model_dump') else dict(result)
        
        # 更新项目
        project.review_issues = result.review_issues
        
        return {
            "project": project,
            "result": result,
            "agent_logs": state["agent_logs"] + [log],
            "current_log": log,
            "error": None
        }
    except Exception as e:
        log.status = "failed"
        log.end_time = utc_now()
        log.error_message = str(e)
        
        return {
            "project": project,
            "result": None,
            "agent_logs": state["agent_logs"] + [log],
            "current_log": log,
            "error": str(e)
        }


def suggest_images_node(state: AgentState) -> Dict[str, Any]:
    """建议图片节点"""
    project = state["project"]
    
    # 创建执行日志
    log = AgentExecutionLog(
        agent_role="image_agent",
        agent_instance_id="image-1",
        task_name="suggest_images",
        status="running",
        start_time=utc_now(),
        thought_chain=[],
        intermediate_outputs=[]
    )
    
    try:
        result = suggest_images(project, log)
        log.status = "completed"
        log.end_time = utc_now()
        log.final_output = result.model_dump() if hasattr(result, 'model_dump') else dict(result)
        
        # 更新项目
        project.image_suggestions = result.image_suggestions
        
        return {
            "project": project,
            "result": result,
            "agent_logs": state["agent_logs"] + [log],
            "current_log": log,
            "error": None
        }
    except Exception as e:
        log.status = "failed"
        log.end_time = utc_now()
        log.error_message = str(e)
        
        return {
            "project": project,
            "result": None,
            "agent_logs": state["agent_logs"] + [log],
            "current_log": log,
            "error": str(e)
        }


def assemble_html_node(state: AgentState) -> Dict[str, Any]:
    """组装HTML节点"""
    project = state["project"]
    
    # 创建执行日志
    log = AgentExecutionLog(
        agent_role="assembler",
        agent_instance_id="assembler-1",
        task_name="assemble_html",
        status="running",
        start_time=utc_now(),
        thought_chain=[],
        intermediate_outputs=[]
    )
    
    try:
        result = assemble_html(project, log)
        log.status = "completed"
        log.end_time = utc_now()
        log.final_output = result.model_dump() if hasattr(result, 'model_dump') else dict(result)
        
        # 更新项目
        # 注意：实际的HTML保存逻辑在orchestrator中处理
        
        return {
            "project": project,
            "result": result,
            "agent_logs": state["agent_logs"] + [log],
            "current_log": log,
            "error": None
        }
    except Exception as e:
        log.status = "failed"
        log.end_time = utc_now()
        log.error_message = str(e)
        
        return {
            "project": project,
            "result": None,
            "agent_logs": state["agent_logs"] + [log],
            "current_log": log,
            "error": str(e)
        }


def route_task(state: AgentState) -> str:
    """任务路由函数"""
    task = state["task"]
    
    if task == "parse" or task == "parse_requirements":
        return "parse_requirements"
    elif task == "plan" or task == "plan_outline":
        return "plan_outline"
    elif task == "write" or task == "write_drafts":
        return "write_drafts"
    elif task == "review" or task == "review_project":
        return "review_project"
    elif task == "images" or task == "suggest_images":
        return "suggest_images"
    elif task == "assemble" or task == "assemble_html":
        return "assemble_html"
    else:
        return END


# 创建工作流
workflow = StateGraph(AgentState)

# 添加节点
workflow.add_node("parse_requirements", parse_requirements_node)
workflow.add_node("plan_outline", plan_outline_node)
workflow.add_node("write_drafts", write_drafts_node)
workflow.add_node("review_project", review_project_node)
workflow.add_node("suggest_images", suggest_images_node)
workflow.add_node("assemble_html", assemble_html_node)

# 设置入口点和路由
workflow.set_conditional_entry_point(route_task)

# 设置所有节点的出口
workflow.add_edge("parse_requirements", END)
workflow.add_edge("plan_outline", END)
workflow.add_edge("write_drafts", END)
workflow.add_edge("review_project", END)
workflow.add_edge("suggest_images", END)
workflow.add_edge("assemble_html", END)

# 编译工作流
compiled_workflow = workflow.compile()


async def run_agent_workflow(project: Project, task: str) -> Any:
    """运行agent工作流"""
    initial_state = {
        "project": project,
        "task": task,
        "agent_logs": []
    }
    
    result = compiled_workflow.invoke(initial_state)
    return result
