from __future__ import annotations

import asyncio
from collections import defaultdict
from functools import wraps
from typing import Any, Callable, Tuple

from .schemas import (
    AgentExecutionLog,
    DraftResult,
    DraftSection,
    EvidenceBinding,
    EvidenceItem,
    HtmlAssembleResult,
    ImageSuggestion,
    ImageSuggestionResult,
    OutlineResult,
    OutlineSection,
    Project,
    RequirementCategory,
    RequirementItem,
    RequirementResult,
    ReviewIssue,
    ReviewIssueType,
    ReviewResult,
    utc_now,
)
from .storage import storage


_agent_execution_context: dict[str, AgentExecutionLog] = {}


def get_agent_log(task_name: str) -> AgentExecutionLog | None:
    return _agent_execution_context.get(task_name)


def clear_agent_logs():
    _agent_execution_context.clear()


def record_agent_execution(task_name: str) -> Callable:
    def decorator(func: Callable) -> Callable:
        if asyncio.iscoroutinefunction(func):
            @wraps(func)
            async def async_wrapper(project: Project, *args, **kwargs) -> Any:
                # 声明全局变量
                global log
                
                log = AgentExecutionLog(
                    agent_role="agent",
                    agent_instance_id=task_name,
                    task_name=task_name,
                    status="in_progress",
                    start_time=utc_now(),
                    thought_chain=[],
                    intermediate_outputs=[],
                )
                _agent_execution_context[task_name] = log

                try:
                    result = await func(project, *args, **kwargs)
                    log.status = "completed"
                    log.end_time = utc_now()
                    log.final_output = result.model_dump() if hasattr(result, 'model_dump') else dict(result)
                    return result
                except Exception as e:
                    log.status = "failed"
                    log.end_time = utc_now()
                    log.error_message = str(e)
                    raise

            return async_wrapper
        else:
            @wraps(func)
            def sync_wrapper(project: Project, *args, **kwargs) -> Any:
                # 声明全局变量
                global log
                
                log = AgentExecutionLog(
                    agent_role="agent",
                    agent_instance_id=task_name,
                    task_name=task_name,
                    status="in_progress",
                    start_time=utc_now(),
                    thought_chain=[],
                    intermediate_outputs=[],
                )
                _agent_execution_context[task_name] = log

                try:
                    result = func(project, *args, **kwargs)
                    log.status = "completed"
                    log.end_time = utc_now()
                    log.final_output = result.model_dump() if hasattr(result, 'model_dump') else dict(result)
                    return result
                except Exception as e:
                    log.status = "failed"
                    log.end_time = utc_now()
                    log.error_message = str(e)
                    raise

            return sync_wrapper
    return decorator



def _group_evidence(project: Project) -> dict[str, list[EvidenceItem]]:
    grouped: dict[str, list[EvidenceItem]] = defaultdict(list)
    for item in project.evidence_items:
        grouped[item.section_hint].append(item)
        grouped["all"].append(item)
    return grouped


@record_agent_execution("parse_requirements")
def parse_requirements(project: Project) -> RequirementResult:
    log.thought_chain.append("开始分析招标文件，提取需求项。")
    
    tender_files = [file for file in project.source_files if file.file_type == "tender"]
    knowledge_files = [file for file in project.source_files if file.file_type == "knowledge"]
    
    log.thought_chain.append(f"找到 {len(tender_files)} 个招标文件，{len(knowledge_files)} 个知识文件。")
    log.intermediate_outputs.append({
        "step": "file_identification",
        "tender_file_count": len(tender_files),
        "knowledge_file_count": len(knowledge_files),
    })
    
    requirements: list[RequirementItem] = []

    for file in tender_files:
        log.thought_chain.append(f"分析招标文件: {file.file_name}")
        requirements.extend(
            [
                RequirementItem(
                    category=RequirementCategory.qualification,
                    source_text=f"{file.file_name} 提到供应商需提供基础资质材料。",
                    normalized_text="提供基础资质、营业执照及相关资格证明。",
                    mandatory=True,
                    risk_level="high",
                ),
                RequirementItem(
                    category=RequirementCategory.scoring,
                    source_text=f"{file.file_name} 包含技术方案评分项。",
                    normalized_text="技术方案需体现实施路径、组织保障与售后机制。",
                    mandatory=True,
                    risk_level="medium",
                ),
                RequirementItem(
                    category=RequirementCategory.format,
                    source_text=f"{file.file_name} 要求按章节响应。",
                    normalized_text="成稿需含封面、目录、正文、附录，章节编号清晰。",
                    mandatory=True,
                    risk_level="medium",
                ),
            ]
        )
        log.intermediate_outputs.append({
            "step": "analyze_tender_file",
            "file_name": file.file_name,
            "requirements_added": 3,
        })

    if knowledge_files:
        log.thought_chain.append("发现知识文件，添加知识复用需求。")
        requirements.append(
            RequirementItem(
                category=RequirementCategory.chapter,
                source_text="已导入企业知识资料。",
                normalized_text="优先复用企业案例、产品能力和服务承诺支撑章节内容。",
                mandatory=False,
                risk_level="low",
            )
        )
        log.intermediate_outputs.append({
            "step": "add_knowledge_requirement",
            "requirements_added": 1,
        })

    log.thought_chain.append(f"需求分析完成，共提取 {len(requirements)} 个需求项。")
    return RequirementResult(requirements=requirements)


@record_agent_execution("plan_outline")
def plan_outline(project: Project) -> OutlineResult:
    log.thought_chain.append("开始规划项目大纲结构。")
    
    log.thought_chain.append("构建标准标书大纲，涵盖项目理解、技术方案、组织保障和资质附录四个核心部分。")
    sections = [
        OutlineSection(
            code="1",
            title="项目理解与总体响应",
            goal="概述对招标目标、建设范围和关键价值的理解。",
            evidence_requirements=["招标要求", "项目目标", "企业能力概览"],
        ),
        OutlineSection(
            code="2",
            title="技术方案与实施路径",
            goal="给出可执行的技术架构、实施步骤和交付方式。",
            evidence_requirements=["技术能力", "实施经验", "里程碑计划"],
        ),
        OutlineSection(
            code="3",
            title="项目组织与服务保障",
            goal="说明项目组织、人员安排、售后服务和风险应对。",
            evidence_requirements=["团队能力", "服务承诺", "风控措施"],
        ),
        OutlineSection(
            code="4",
            title="资质、案例与附录",
            goal="汇总资格证明、类似案例和必要附件。",
            evidence_requirements=["企业资质", "案例材料", "附件清单"],
        ),
    ]
    
    log.intermediate_outputs.append({
        "step": "outline_created",
        "section_count": len(sections),
        "sections": [
            {"code": s.code, "title": s.title}
            for s in sections
        ],
    })
    
    log.thought_chain.append(f"大纲规划完成，共创建 {len(sections)} 个章节。")
    return OutlineResult(outline=sections)


@record_agent_execution("write_drafts")
def write_drafts(project: Project, enable_rag: bool = False, enable_image_insertion: bool = False) -> DraftResult:
    log.thought_chain.append("开始撰写各章节草稿。")
    
    # 记录用户决策
    log.thought_chain.append(f"用户决策 - RAG: {enable_rag}, 图片插入: {enable_image_insertion}")
    log.intermediate_outputs.append({
        "step": "user_decisions",
        "enable_rag": enable_rag,
        "enable_image_insertion": enable_image_insertion,
    })
    
    evidence = _group_evidence(project)
    log.thought_chain.append(f"已分组证据，共 {len(evidence)} 个证据分组。")
    log.intermediate_outputs.append({
        "step": "evidence_grouped",
        "group_count": len(evidence),
        "group_keys": list(evidence.keys()),
    })
    
    drafts: list[DraftSection] = []
    for index, section in enumerate(project.outline):
        log.thought_chain.append(f"正在撰写第 {index+1} 章节: {section.title}")
        section_evidence = evidence.get(section.title, [])[:2] or evidence.get("all", [])[:2]
        
        body = [
            f"### {section.title}",
            "",
            f"本节围绕“{section.goal}”展开，响应标书的核心要求，并结合已导入资料给出可执行内容。",
        ]
        
        # 添加RAG相关内容
        if enable_rag:
            body.append("")
            body.append("【知识库信息】")
            body.append("根据企业知识库中的相关信息，本节内容已结合最新的企业案例和产品信息进行了优化。")
        
        evidence_bindings = []
        if section_evidence:
            body.append("")
            body.append("关键支撑证据：")
            for item in section_evidence:
                # 创建证据绑定
                binding = EvidenceBinding(
                    evidence_id=item.id,
                    evidence_text=item.content,
                    source_name=item.source_name,
                    location_hint=item.location_hint,
                    confidence=item.confidence,
                    start_pos=item.start_pos,
                    end_pos=item.end_pos,
                    page_number=item.page_number,
                    citation_text=f"{item.source_name} - {item.location_hint}"
                )
                evidence_bindings.append(binding)
                
                # 构建证据引用文本
                location_info = []
                if item.page_number:
                    location_info.append(f"第{item.page_number}页")
                if item.start_pos is not None and item.end_pos is not None:
                    location_info.append(f"位置 {item.start_pos}-{item.end_pos}")
                location_str = "，" + "，".join(location_info) if location_info else ""
                
                body.append(f"- {item.content}（来源：{item.source_name}{location_str}，可信度：{item.confidence:.2f}）")
        else:
            body.append("")
            body.append("当前缺少直接证据，需补充企业资料或历史案例。")
        
        # 添加图片插入提示
        if enable_image_insertion:
            body.append("")
            body.append("【图片建议】")
            body.append("本节建议插入相关图片以增强内容表现力，可在后续步骤中选择合适的图片。")
        
        body.append("")
        body.append("本节建议在后续版本中补充定量指标、时间计划和责任矩阵。")
        
        draft = DraftSection(
            outline_section_id=section.id,
            title=section.title,
            content="\n".join(body),
            evidence_bindings=evidence_bindings,
            evidence_ids=[item.id for item in section_evidence],
            missing_inputs=[] if section_evidence else ["缺少直接证据"],
        )
        drafts.append(draft)
        
        log.intermediate_outputs.append({
            "step": "draft_written",
            "section_index": index,
            "section_title": section.title,
            "evidence_count": len(section_evidence),
            "has_missing_inputs": bool(draft.missing_inputs),
            "enable_rag": enable_rag,
            "enable_image_insertion": enable_image_insertion,
        })

    log.thought_chain.append(f"草稿撰写完成，共完成 {len(drafts)} 个章节。")
    return DraftResult(drafts=drafts)


@record_agent_execution("review_project")
def review_project(project: Project) -> ReviewResult:
    log.thought_chain.append("开始审查项目内容。")
    
    log.thought_chain.append(f"发现 {len(project.drafts)} 个草稿章节需要审查。")
    log.thought_chain.append(f"项目共有 {len(project.source_files)} 个源文件。")
    log.intermediate_outputs.append({
        "step": "review_start",
        "draft_count": len(project.drafts),
        "source_file_count": len(project.source_files),
    })
    
    issues: list[ReviewIssue] = []
    for index, draft in enumerate(project.drafts):
        log.thought_chain.append(f"正在审查章节: {draft.title}")
        if not draft.evidence_ids:
            log.thought_chain.append(f"发现问题: 章节 {draft.title} 没有绑定证据。")
            issues.append(
                ReviewIssue(
                    issue_type=ReviewIssueType.compliance,
                    severity="high",
                    section_title=draft.title,
                    message="本章节没有绑定证据，存在内容失真风险。",
                    suggested_action="补充企业资料或案例证据后重写本章节。",
                )
            )
        if "资质" in draft.title:
            log.thought_chain.append(f"发现问题: 资质章节 {draft.title} 可优化。")
            issues.append(
                ReviewIssue(
                    issue_type=ReviewIssueType.scoring,
                    severity="medium",
                    section_title=draft.title,
                    message="资质与案例章节可进一步按评分点重组，以提高可得分性。",
                    suggested_action="增加评分点映射表和案例对应说明。",
                )
            )
        log.intermediate_outputs.append({
            "step": "review_draft",
            "draft_index": index,
            "section_title": draft.title,
            "issues_found_in_section": sum(1 for i in issues if i.section_title == draft.title),
        })

    if not project.source_files:
        log.thought_chain.append("发现问题: 项目未上传任何源文件。")
        issues.append(
            ReviewIssue(
                issue_type=ReviewIssueType.consistency,
                severity="high",
                section_title="整体",
                message="尚未上传任何资料，无法形成可信成稿。",
                suggested_action="先上传招标文件和企业知识资料。",
            )
        )
        log.intermediate_outputs.append({
            "step": "review_overall",
            "has_missing_source_files": True,
        })

    log.thought_chain.append(f"审查完成，共发现 {len(issues)} 个问题。")
    return ReviewResult(review_issues=issues)


@record_agent_execution("suggest_images")
def suggest_images(project: Project) -> ImageSuggestionResult:
    log.thought_chain.append("开始为项目建议图片。")
    
    suggestions: list[ImageSuggestion] = []
    image_files = [file for file in project.source_files if file.file_type == "image"]
    outline_titles = [section.title for section in project.outline] or ["技术方案与实施路径"]
    
    log.thought_chain.append(f"发现 {len(image_files)} 个图片文件，{len(outline_titles)} 个大纲章节。")
    log.intermediate_outputs.append({
        "step": "image_discovery",
        "image_file_count": len(image_files),
        "outline_section_count": len(outline_titles),
    })
    
    for index, file in enumerate(image_files[:6]):
        section_title = outline_titles[index % len(outline_titles)]
        log.thought_chain.append(f"为图片 {file.file_name} 建议放入章节: {section_title}")
        
        suggestion = ImageSuggestion(
            source_file_id=file.id,
            source_name=file.file_name,
            suggested_section_title=section_title,
            usage_label="产品图" if "产品" in file.file_name else "项目示意图",
            placement="section-body-after-first-paragraph",
            caption=f"{section_title}配图：{file.file_name}",
            preview_url=storage.get_file_url(file.object_key),
        )
        suggestions.append(suggestion)
        
        log.intermediate_outputs.append({
            "step": "image_suggestion",
            "suggestion_index": index,
            "file_name": file.file_name,
            "suggested_section": section_title,
            "usage_label": suggestion.usage_label,
        })

    log.thought_chain.append(f"图片建议完成，共推荐 {len(suggestions)} 张图片。")
    return ImageSuggestionResult(image_suggestions=suggestions)


@record_agent_execution("assemble_html")
def assemble_html(project: Project) -> HtmlAssembleResult:
    log.thought_chain.append("开始组装 HTML 标书。")
    
    selected_map = {selection.suggestion_id: selection for selection in project.image_selections if selection.accepted}
    image_by_suggestion = {suggestion.id: suggestion for suggestion in project.image_suggestions}
    
    log.thought_chain.append(f"发现 {len(selected_map)} 个已接受的图片选择，{len(project.drafts)} 个草稿章节。")
    log.intermediate_outputs.append({
        "step": "html_assembly_start",
        "accepted_image_count": len(selected_map),
        "draft_count": len(project.drafts),
        "review_issue_count": len(project.review_issues),
    })


    parts = [
        "<!DOCTYPE html>",
        '<html lang="zh-CN">',
        "<head>",
        '<meta charset="UTF-8" />',
        '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
        f"<title>{project.name} 标书草稿</title>",
        "<style>body{font-family:'Microsoft YaHei',sans-serif;max-width:960px;margin:0 auto;padding:32px;line-height:1.8;color:#222;}h1,h2{color:#8a4b21;}img{max-width:100%;border-radius:12px;}figure{margin:24px 0;}figcaption{color:#666;font-size:14px;}nav ul{padding-left:20px;}section{margin-bottom:36px;border-bottom:1px solid #eee;padding-bottom:24px;}</style>",
        "</head>",
        "<body>",
        f"<h1>{project.name}</h1>",
        f"<p>{project.description or '自动生成的标书草稿。'}</p>",
        "<nav><h2>目录</h2><ul>",
    ]

    for draft in project.drafts:
        parts.append(f'<li><a href="#{draft.outline_section_id}">{draft.title}</a></li>')
    parts.append("</ul></nav>")
    
    log.thought_chain.append("目录生成完成。")

    image_count_inserted = 0
    for index, draft in enumerate(project.drafts):
        log.thought_chain.append(f"正在组装章节: {draft.title}")
        parts.append(f'<section id="{draft.outline_section_id}">')
        parts.append(f"<h2>{draft.title}</h2>")
        for paragraph in draft.content.split("\n\n"):
            if paragraph.strip():
                parts.append(f"<p>{paragraph.replace(chr(10), '<br/>')}</p>")
        
        # 添加证据绑定信息
        if draft.evidence_bindings:
            parts.append("<div style='margin-top:24px;padding:16px;background-color:#f8f9fa;border-radius:8px;'>")
            parts.append("<h4 style='margin-top:0;'>证据来源明细：</h4>")
            parts.append("<ul style='margin-bottom:0;'>")
            for binding in draft.evidence_bindings:
                location_info = []
                if binding.page_number:
                    location_info.append(f"第{binding.page_number}页")
                if binding.start_pos is not None and binding.end_pos is not None:
                    location_info.append(f"位置 {binding.start_pos}-{binding.end_pos}")
                location_str = "，" + "，".join(location_info) if location_info else ""
                parts.append(f"<li><strong>来源：</strong>{binding.source_name}{location_str}，<strong>可信度：</strong>{binding.confidence:.2f}</li>")
                parts.append(f"<li style='margin-left:20px;'><strong>内容：</strong>{binding.evidence_text}</li>")
            parts.append("</ul>")
            parts.append("</div>")
        
        for suggestion_id in selected_map:
            suggestion = image_by_suggestion.get(suggestion_id)
            if suggestion and suggestion.suggested_section_title == draft.title:
                parts.append("<figure>")
                parts.append(f'<img src="{suggestion.preview_url or ""}" alt="{suggestion.caption}" />')
                parts.append(f"<figcaption>{suggestion.caption}</figcaption>")
                parts.append("</figure>")
                image_count_inserted += 1
        parts.append("</section>")
        
        log.intermediate_outputs.append({
            "step": "assemble_section",
            "section_index": index,
            "section_title": draft.title,
            "images_inserted": sum(1 for s_id in selected_map 
                                   if image_by_suggestion.get(s_id) 
                                   and image_by_suggestion.get(s_id).suggested_section_title == draft.title),
        })

    if project.review_issues:
        log.thought_chain.append("添加审查摘要部分。")
        parts.append("<section><h2>审查摘要</h2><ul>")
        for issue in project.review_issues:
            parts.append(f"<li>[{issue.severity}] {issue.section_title}: {issue.message}</li>")
        parts.append("</ul></section>")

    parts.extend(["</body>", "</html>"])
    
    log.thought_chain.append(f"HTML 组装完成，共插入 {image_count_inserted} 张图片。")
    log.intermediate_outputs.append({
        "step": "html_completed",
        "total_images_inserted": image_count_inserted,
        "total_sections": len(project.drafts),
        "has_review_summary": bool(project.review_issues),
    })
    
    return HtmlAssembleResult(html="\n".join(parts))
