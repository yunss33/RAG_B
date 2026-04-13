from deepbs_common.agent_logic import assemble_html, parse_requirements, plan_outline, review_project, suggest_images, write_drafts
from deepbs_common.schemas import FileType, Project, SourceFile


def sample_project() -> Project:
    project = Project(name="测试项目")
    project.source_files.append(
        SourceFile(file_name="招标文件.txt", file_type=FileType.tender, object_key="tender.txt")
    )
    project.source_files.append(
        SourceFile(file_name="企业资质.txt", file_type=FileType.knowledge, object_key="company.txt")
    )
    project.source_files.append(
        SourceFile(file_name="产品图.png", file_type=FileType.image, object_key="image.png")
    )
    return project


def test_end_to_end_stub_flow():
    project = sample_project()
    project.requirements = parse_requirements(project).requirements
    assert project.requirements

    project.outline = plan_outline(project).outline
    assert len(project.outline) >= 4

    project.drafts = write_drafts(project).drafts
    assert len(project.drafts) == len(project.outline)

    project.review_issues = review_project(project).review_issues
    assert project.review_issues is not None

    project.image_suggestions = suggest_images(project).image_suggestions
    assert len(project.image_suggestions) == 1

    html = assemble_html(project).html
    assert "测试项目" in html
    assert "<html" in html
