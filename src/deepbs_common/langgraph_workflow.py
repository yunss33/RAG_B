from __future__ import annotations

from typing import TypedDict, Optional, List, Dict, Any
from langgraph.graph import StateGraph, END

from .schemas import (
    Project, RequirementResult, OutlineResult, DraftResult, ReviewResult, 
    ImageSuggestionResult, HtmlAssembleResult, AgentExecutionLog, utc_now
)
from .skill_system import skill_manager


class AgentState(TypedDict):
    """Agent工作流状态"""
    project: Project
    task: str
    result: Optional[Any] = None
    agent_logs: List[AgentExecutionLog] = []
    current_log: Optional[AgentExecutionLog] = None
    error: Optional[str] = None


async def skill_execution_node(state: AgentState) -> Dict[str, Any]:
    """技能执行节点"""
    project = state["project"]
    task = state["task"]
    
    # 映射任务名称到技能名称
    task_skill_map = {
        "parse": "parse_requirements",
        "parse_requirements": "parse_requirements",
        "plan": "plan_outline",
        "plan_outline": "plan_outline",
        "write": "write_drafts",
        "write_drafts": "write_drafts",
        "review": "review_project",
        "review_project": "review_project",
        "images": "suggest_images",
        "suggest_images": "suggest_images",
        "assemble": "assemble_html",
        "assemble_html": "assemble_html"
    }
    
    skill_name = task_skill_map.get(task)
    if not skill_name:
        return {
            "project": project,
            "result": None,
            "agent_logs": state["agent_logs"],
            "current_log": None,
            "error": f"Unknown task: {task}"
        }
    
    # 创建执行日志
    log = AgentExecutionLog(
        agent_role=skill_name.split('_')[0],
        agent_instance_id=f"{skill_name}-1",
        task_name=skill_name,
        status="running",
        start_time=utc_now(),
        thought_chain=[],
        intermediate_outputs=[]
    )
    
    try:
        # 执行技能
        result = await skill_manager.execute_skill(skill_name, project, {"log": log})
        
        log.status = "completed"
        log.end_time = utc_now()
        log.final_output = result["result"].model_dump() if hasattr(result["result"], 'model_dump') else dict(result["result"])
        
        return {
            "project": result["project"],
            "result": result["result"],
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
    return "skill_execution"


# 创建工作流
workflow = StateGraph(AgentState)

# 添加技能执行节点
workflow.add_node("skill_execution", skill_execution_node)

# 设置入口点和路由
workflow.set_conditional_entry_point(route_task)

# 设置节点的出口
workflow.add_edge("skill_execution", END)

# 编译工作流
compiled_workflow = workflow.compile()


async def run_agent_workflow(project: Project, task: str) -> Any:
    """运行agent工作流"""
    initial_state = {
        "project": project,
        "task": task,
        "agent_logs": []
    }
    
    result = await compiled_workflow.ainvoke(initial_state)
    return result
