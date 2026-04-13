from __future__ import annotations

from typing import Dict, List, Optional, Type, Callable, Any
from abc import ABC, abstractmethod
from dataclasses import dataclass

from .schemas import Project, AgentExecutionLog
from .agent_logic import record_agent_execution


@dataclass
class SkillMetadata:
    """技能元数据"""
    name: str
    description: str
    category: str  # analysis, creation, review, etc.
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]
    dependencies: List[str] = None
    
    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []


class Skill(ABC):
    """技能基类"""
    
    @property
    @abstractmethod
    def metadata(self) -> SkillMetadata:
        """技能元数据"""
        pass
    
    @abstractmethod
    async def execute(self, project: Project, context: Dict[str, Any]) -> Dict[str, Any]:
        """执行技能"""
        pass


class SkillFactory:
    """技能工厂，负责创建技能实例"""
    
    def __init__(self):
        self._skill_classes: Dict[str, Type[Skill]] = {}
    
    def register_skill(self, skill_class: Type[Skill]):
        """注册技能类"""
        metadata = skill_class().metadata
        self._skill_classes[metadata.name] = skill_class
    
    def create_skill(self, skill_name: str) -> Optional[Skill]:
        """创建技能实例"""
        skill_class = self._skill_classes.get(skill_name)
        if skill_class:
            return skill_class()
        return None
    
    def get_available_skills(self) -> List[SkillMetadata]:
        """获取所有可用技能的元数据"""
        return [skill_class().metadata for skill_class in self._skill_classes.values()]
    
    def get_skill_metadata(self, skill_name: str) -> Optional[SkillMetadata]:
        """获取技能元数据"""
        skill_class = self._skill_classes.get(skill_name)
        if skill_class:
            return skill_class().metadata
        return None


class SkillPool:
    """技能池，管理技能实例的生命周期"""
    
    def __init__(self, skill_factory: SkillFactory):
        self._skill_factory = skill_factory
        self._skill_instances: Dict[str, Skill] = {}
    
    def get_skill(self, skill_name: str) -> Optional[Skill]:
        """获取技能实例，不存在则创建"""
        if skill_name not in self._skill_instances:
            skill = self._skill_factory.create_skill(skill_name)
            if skill:
                self._skill_instances[skill_name] = skill
        return self._skill_instances.get(skill_name)
    
    def release_skill(self, skill_name: str):
        """释放技能实例"""
        if skill_name in self._skill_instances:
            del self._skill_instances[skill_name]
    
    def clear(self):
        """清空技能池"""
        self._skill_instances.clear()


class SkillManager:
    """技能管理器，负责技能的发现、推荐和执行"""
    
    def __init__(self):
        self.skill_factory = SkillFactory()
        self.skill_pool = SkillPool(self.skill_factory)
    
    def register_skill(self, skill_class: Type[Skill]):
        """注册技能"""
        self.skill_factory.register_skill(skill_class)
    
    async def execute_skill(self, skill_name: str, project: Project, context: Dict[str, Any]) -> Dict[str, Any]:
        """执行技能"""
        skill = self.skill_pool.get_skill(skill_name)
        if not skill:
            raise ValueError(f"Skill {skill_name} not found")
        
        return await skill.execute(project, context)
    
    def get_available_skills(self) -> List[SkillMetadata]:
        """获取所有可用技能"""
        return self.skill_factory.get_available_skills()
    
    def recommend_skills(self, project: Project) -> List[Dict[str, Any]]:
        """推荐适合的技能组合"""
        available_skills = self.get_available_skills()
        recommendations = []
        
        # 基于项目状态推荐技能
        if not project.requirements:
            recommendations.append({
                "skill_name": "parse_requirements",
                "reason": "项目缺少需求分析，建议先执行需求解析技能"
            })
        elif not project.outline:
            recommendations.append({
                "skill_name": "plan_outline",
                "reason": "项目缺少大纲，建议执行大纲规划技能"
            })
        elif not project.drafts:
            recommendations.append({
                "skill_name": "write_drafts",
                "reason": "项目缺少草稿，建议执行草稿撰写技能"
            })
        else:
            recommendations.append({
                "skill_name": "review_project",
                "reason": "项目已有草稿，建议执行审查技能"
            })
            
            if project.source_files:
                recommendations.append({
                    "skill_name": "suggest_images",
                    "reason": "项目有源文件，建议执行图片建议技能"
                })
            
            recommendations.append({
                "skill_name": "assemble_html",
                "reason": "项目已有草稿，建议执行HTML组装技能"
            })
        
        return recommendations


# 创建全局技能管理器
skill_manager = SkillManager()


class ParseRequirementsSkill(Skill):
    """需求解析技能"""
    
    @property
    def metadata(self) -> SkillMetadata:
        return SkillMetadata(
            name="parse_requirements",
            description="解析招标文件，提取需求项",
            category="analysis",
            input_schema={"project": "Project"},
            output_schema={"requirements": "List[RequirementItem]"},
            dependencies=[]
        )
    
    @record_agent_execution("parse_requirements")
    async def execute(self, project: Project, context: Dict[str, Any]) -> Dict[str, Any]:
        from .agent_logic import parse_requirements
        result = parse_requirements(project)
        project.requirements = result.requirements
        return {"result": result, "project": project}


class PlanOutlineSkill(Skill):
    """大纲规划技能"""
    
    @property
    def metadata(self) -> SkillMetadata:
        return SkillMetadata(
            name="plan_outline",
            description="规划项目大纲结构",
            category="analysis",
            input_schema={"project": "Project"},
            output_schema={"outline": "List[OutlineSection]"},
            dependencies=["parse_requirements"]
        )
    
    @record_agent_execution("plan_outline")
    async def execute(self, project: Project, context: Dict[str, Any]) -> Dict[str, Any]:
        from .agent_logic import plan_outline
        result = plan_outline(project)
        project.outline = result.outline
        return {"result": result, "project": project}


class WriteDraftsSkill(Skill):
    """草稿撰写技能"""
    
    @property
    def metadata(self) -> SkillMetadata:
        return SkillMetadata(
            name="write_drafts",
            description="撰写各章节草稿",
            category="creation",
            input_schema={"project": "Project", "section_id": "Optional[str]"},
            output_schema={"drafts": "List[DraftSection]"},
            dependencies=["plan_outline"]
        )
    
    @record_agent_execution("write_drafts")
    async def execute(self, project: Project, context: Dict[str, Any]) -> Dict[str, Any]:
        from .agent_logic import write_drafts
        result = write_drafts(project)
        project.drafts = result.drafts
        return {"result": result, "project": project}


class ReviewProjectSkill(Skill):
    """项目审查技能"""
    
    @property
    def metadata(self) -> SkillMetadata:
        return SkillMetadata(
            name="review_project",
            description="审查项目内容",
            category="review",
            input_schema={"project": "Project"},
            output_schema={"review_issues": "List[ReviewIssue]"},
            dependencies=["write_drafts"]
        )
    
    @record_agent_execution("review_project")
    async def execute(self, project: Project, context: Dict[str, Any]) -> Dict[str, Any]:
        from .agent_logic import review_project
        result = review_project(project)
        project.review_issues = result.review_issues
        return {"result": result, "project": project}


class SuggestImagesSkill(Skill):
    """图片建议技能"""
    
    @property
    def metadata(self) -> SkillMetadata:
        return SkillMetadata(
            name="suggest_images",
            description="为项目建议图片",
            category="creation",
            input_schema={"project": "Project"},
            output_schema={"image_suggestions": "List[ImageSuggestion]"},
            dependencies=["plan_outline"]
        )
    
    @record_agent_execution("suggest_images")
    async def execute(self, project: Project, context: Dict[str, Any]) -> Dict[str, Any]:
        from .agent_logic import suggest_images
        result = suggest_images(project)
        project.image_suggestions = result.image_suggestions
        return {"result": result, "project": project}


class AssembleHtmlSkill(Skill):
    """HTML组装技能"""
    
    @property
    def metadata(self) -> SkillMetadata:
        return SkillMetadata(
            name="assemble_html",
            description="组装HTML标书",
            category="creation",
            input_schema={"project": "Project"},
            output_schema={"html": "str"},
            dependencies=["write_drafts", "review_project"]
        )
    
    @record_agent_execution("assemble_html")
    async def execute(self, project: Project, context: Dict[str, Any]) -> Dict[str, Any]:
        from .agent_logic import assemble_html
        result = assemble_html(project)
        return {"result": result, "project": project}


# 注册技能
skill_manager.register_skill(ParseRequirementsSkill)
skill_manager.register_skill(PlanOutlineSkill)
skill_manager.register_skill(WriteDraftsSkill)
skill_manager.register_skill(ReviewProjectSkill)
skill_manager.register_skill(SuggestImagesSkill)
skill_manager.register_skill(AssembleHtmlSkill)