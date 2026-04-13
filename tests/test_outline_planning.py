from deepbs_common.agent_logic import plan_outline
from deepbs_common.schemas import Project, SourceFile, FileType

def sample_project() -> Project:
    project = Project(name="测试项目")
    project.source_files.append(
        SourceFile(file_name="招标文件.txt", file_type=FileType.tender, object_key="tender.txt")
    )
    project.source_files.append(
        SourceFile(file_name="企业资质.txt", file_type=FileType.knowledge, object_key="company.txt")
    )
    return project

def test_outline_structure():
    """测试大纲结构是否正确"""
    project = sample_project()
    result = plan_outline(project)
    
    # 验证大纲不为空
    assert result.outline is not None
    assert len(result.outline) == 4
    
    # 验证每个章节的结构
    expected_sections = [
        {"code": "1", "title": "项目理解与总体响应"},
        {"code": "2", "title": "技术方案与实施路径"},
        {"code": "3", "title": "项目组织与服务保障"},
        {"code": "4", "title": "资质、案例与附录"}
    ]
    
    for i, expected in enumerate(expected_sections):
        section = result.outline[i]
        assert section.code == expected["code"]
        assert section.title == expected["title"]
        assert hasattr(section, "goal")
        assert hasattr(section, "evidence_requirements")
        assert section.goal is not None
        assert isinstance(section.evidence_requirements, list)
        assert len(section.evidence_requirements) > 0

def test_outline_section_details():
    """测试章节信息是否完整"""
    project = sample_project()
    result = plan_outline(project)
    
    # 验证每个章节的详细信息
    sections = result.outline
    
    # 验证章节1
    section1 = sections[0]
    assert "项目理解" in section1.title
    assert "招标目标" in section1.goal
    assert "招标要求" in section1.evidence_requirements
    
    # 验证章节2
    section2 = sections[1]
    assert "技术方案" in section2.title
    assert "技术架构" in section2.goal
    assert "技术能力" in section2.evidence_requirements
    
    # 验证章节3
    section3 = sections[2]
    assert "组织" in section3.title
    assert "人员安排" in section3.goal
    assert "团队能力" in section3.evidence_requirements
    
    # 验证章节4
    section4 = sections[3]
    assert "资质" in section4.title
    assert "资格证明" in section4.goal
    assert "企业资质" in section4.evidence_requirements

def test_outline_consistency():
    """测试大纲的一致性"""
    project1 = sample_project()
    project2 = sample_project()
    
    result1 = plan_outline(project1)
    result2 = plan_outline(project2)
    
    # 验证两次生成的大纲结构一致
    assert len(result1.outline) == len(result2.outline)
    
    for i in range(len(result1.outline)):
        assert result1.outline[i].code == result2.outline[i].code
        assert result1.outline[i].title == result2.outline[i].title
        assert result1.outline[i].goal == result2.outline[i].goal
        assert result1.outline[i].evidence_requirements == result2.outline[i].evidence_requirements

if __name__ == "__main__":
    test_outline_structure()
    test_outline_section_details()
    test_outline_consistency()
    print("所有测试通过！")
