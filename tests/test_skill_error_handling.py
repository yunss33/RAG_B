import pytest
from deepbs_common.skill_system import skill_manager
from deepbs_common.schemas import Project


@pytest.mark.asyncio
async def test_nonexistent_skill():
    """测试执行不存在的技能"""
    project = Project(name="测试项目")
    
    # 测试执行不存在的技能
    try:
        await skill_manager.execute_skill("nonexistent_skill", project, {})
        pytest.fail("测试失败：执行不存在的技能应该失败")
    except ValueError as e:
        assert "Skill nonexistent_skill not found" in str(e)
        print("测试通过：执行不存在的技能返回正确的错误信息")


@pytest.mark.asyncio
async def test_invalid_parameters():
    """测试传递无效参数的情况"""
    project = Project(name="测试项目")
    
    # 测试1：执行需要项目的技能时传递无效项目
    try:
        # 这里我们尝试传递一个无效的项目对象
        await skill_manager.execute_skill("parse_requirements", None, {})
        pytest.fail("测试1失败：传递无效项目应该失败")
    except Exception as e:
        print(f"测试1通过：传递无效项目返回错误 - {str(e)}")

    # 测试2：执行需要特定参数的技能时传递缺少参数
    # 先执行依赖技能
    from deepbs_common.schemas import SourceFile, FileType
    project.source_files.append(SourceFile(file_name="招标文件.txt", file_type=FileType.tender, object_key="tender.txt"))
    parse_result = await skill_manager.execute_skill("parse_requirements", project, {})
    project = parse_result.get("project", project)
    
    # 现在项目有了需求，应该可以执行 plan_outline 技能
    try:
        result = await skill_manager.execute_skill("plan_outline", project, {})
        assert result is not None
        print("测试2通过：传递正确参数时执行成功")
    except Exception as e:
        pytest.fail(f"测试2失败：传递正确参数时执行失败 - {str(e)}")


@pytest.mark.asyncio
async def test_skill_dependency_errors():
    """测试技能依赖错误"""
    project = Project(name="测试项目")
    
    # 测试执行有依赖的技能（依赖未满足）
    try:
        await skill_manager.execute_skill("plan_outline", project, {})
        pytest.fail("测试失败：依赖未满足时应该失败")
    except ValueError as e:
        assert "Dependency skill parse_requirements not found" in str(e) or "Dependency skill parse_requirements has not been executed yet" in str(e)
        print("测试通过：依赖未满足时返回正确的错误信息")


@pytest.mark.asyncio
async def test_section_confirmation_error():
    """测试章节确认错误"""
    project = Project(name="测试项目")
    
    # 添加源文件
    from deepbs_common.schemas import SourceFile, FileType
    project.source_files.append(SourceFile(file_name="招标文件.txt", file_type=FileType.tender, object_key="tender.txt"))
    
    # 执行 parse_requirements
    parse_result = await skill_manager.execute_skill("parse_requirements", project, {})
    project = parse_result.get("project", project)
    
    # 执行 plan_outline
    outline_result = await skill_manager.execute_skill("plan_outline", project, {})
    project = outline_result.get("project", project)
    
    # 此时章节未确认，尝试执行 write_drafts 应该失败
    try:
        await skill_manager.execute_skill("write_drafts", project, {})
        pytest.fail("测试失败：章节未确认时执行 write_drafts 应该失败")
    except ValueError as e:
        assert "章节大纲未确认" in str(e)
        print("测试通过：章节未确认时返回正确的错误信息")


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_nonexistent_skill())
    asyncio.run(test_invalid_parameters())
    asyncio.run(test_skill_dependency_errors())
    asyncio.run(test_section_confirmation_error())
