from __future__ import annotations

from collections import defaultdict

from .schemas import (
    DraftResult,
    DraftSection,
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
)
from .storage import storage


def _group_evidence(project: Project) -> dict[str, list[EvidenceItem]]:
    grouped: dict[str, list[EvidenceItem]] = defaultdict(list)
    for item in project.evidence_items:
        grouped[item.section_hint].append(item)
        grouped["all"].append(item)
    return grouped


def parse_requirements(project: Project) -> RequirementResult:
    tender_files = [file for file in project.source_files if file.file_type == "tender"]
    knowledge_files = [file for file in project.source_files if file.file_type == "knowledge"]
    requirements: list[RequirementItem] = []

    for file in tender_files:
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

    if knowledge_files:
        requirements.append(
            RequirementItem(
                category=RequirementCategory.chapter,
                source_text="已导入企业知识资料。",
                normalized_text="优先复用企业案例、产品能力和服务承诺支撑章节内容。",
                mandatory=False,
                risk_level="low",
            )
        )

    return RequirementResult(requirements=requirements)


def plan_outline(project: Project) -> OutlineResult:
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
    return OutlineResult(outline=sections)


def write_drafts(project: Project) -> DraftResult:
    evidence = _group_evidence(project)
    drafts: list[DraftSection] = []
    for section in project.outline:
        section_evidence = evidence.get(section.title, [])[:2] or evidence.get("all", [])[:2]
        body = [
            f"### {section.title}",
            "",
            f"本节围绕“{section.goal}”展开，响应标书的核心要求，并结合已导入资料给出可执行内容。",
        ]
        if section_evidence:
            body.append("")
            body.append("关键支撑证据：")
            for item in section_evidence:
                body.append(f"- {item.content}（来源：{item.source_name}）")
        else:
            body.append("")
            body.append("当前缺少直接证据，需补充企业资料或历史案例。")
        body.append("")
        body.append("本节建议在后续版本中补充定量指标、时间计划和责任矩阵。")
        drafts.append(
            DraftSection(
                outline_section_id=section.id,
                title=section.title,
                content="\n".join(body),
                evidence_ids=[item.id for item in section_evidence],
                missing_inputs=[] if section_evidence else ["缺少直接证据"],
            )
        )
    return DraftResult(drafts=drafts)


def review_project(project: Project) -> ReviewResult:
    issues: list[ReviewIssue] = []
    for draft in project.drafts:
        if not draft.evidence_ids:
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
            issues.append(
                ReviewIssue(
                    issue_type=ReviewIssueType.scoring,
                    severity="medium",
                    section_title=draft.title,
                    message="资质与案例章节可进一步按评分点重组，以提高可得分性。",
                    suggested_action="增加评分点映射表和案例对应说明。",
                )
            )

    if not project.source_files:
        issues.append(
            ReviewIssue(
                issue_type=ReviewIssueType.consistency,
                severity="high",
                section_title="整体",
                message="尚未上传任何资料，无法形成可信成稿。",
                suggested_action="先上传招标文件和企业知识资料。",
            )
        )

    return ReviewResult(review_issues=issues)


def suggest_images(project: Project) -> ImageSuggestionResult:
    suggestions: list[ImageSuggestion] = []
    image_files = [file for file in project.source_files if file.file_type == "image"]
    outline_titles = [section.title for section in project.outline] or ["技术方案与实施路径"]
    for index, file in enumerate(image_files[:6]):
        section_title = outline_titles[index % len(outline_titles)]
        suggestions.append(
            ImageSuggestion(
                source_file_id=file.id,
                source_name=file.file_name,
                suggested_section_title=section_title,
                usage_label="产品图" if "产品" in file.file_name else "项目示意图",
                placement="section-body-after-first-paragraph",
                caption=f"{section_title}配图：{file.file_name}",
                preview_url=storage.get_file_url(file.object_key),
            )
        )
    return ImageSuggestionResult(image_suggestions=suggestions)


def assemble_html(project: Project) -> HtmlAssembleResult:
    selected_map = {selection.suggestion_id: selection for selection in project.image_selections if selection.accepted}
    image_by_suggestion = {suggestion.id: suggestion for suggestion in project.image_suggestions}

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

    for draft in project.drafts:
        parts.append(f'<section id="{draft.outline_section_id}">')
        parts.append(f"<h2>{draft.title}</h2>")
        for paragraph in draft.content.split("\n\n"):
            if paragraph.strip():
                parts.append(f"<p>{paragraph.replace(chr(10), '<br/>')}</p>")
        for suggestion_id in selected_map:
            suggestion = image_by_suggestion.get(suggestion_id)
            if suggestion and suggestion.suggested_section_title == draft.title:
                parts.append("<figure>")
                parts.append(f'<img src="{suggestion.preview_url or ""}" alt="{suggestion.caption}" />')
                parts.append(f"<figcaption>{suggestion.caption}</figcaption>")
                parts.append("</figure>")
        parts.append("</section>")

    if project.review_issues:
        parts.append("<section><h2>审查摘要</h2><ul>")
        for issue in project.review_issues:
            parts.append(f"<li>[{issue.severity}] {issue.section_title}: {issue.message}</li>")
        parts.append("</ul></section>")

    parts.extend(["</body>", "</html>"])
    return HtmlAssembleResult(html="\n".join(parts))
