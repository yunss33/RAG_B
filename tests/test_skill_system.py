import pytest
from deepbs_common.skill_system import skill_manager
from deepbs_common.schemas import Project


async def test_skill_dependencies():
    """测试技能依赖关系检查"""
    
    # 测试1：直接执行依赖技能（应该成功）
    project1 = Project(name="测试项目1")
    try:
        result = await skill_manager.execute_skill("parse_requirements", project1, {})
        assert result is not None
        print("测试1通过：直接执行依赖技能成功")
    except Exception as e:
        pytest.fail(f"测试1失败：直接执行依赖技能失败 - {str(e)}")
    
    # 测试2：执行有依赖的技能（依赖未满足，应该失败）
    project2 = Project(name="测试项目2")
    try:
        result = await skill_manager.execute_skill("plan_outline", project2, {})
        pytest.fail("测试2失败：依赖未满足时应该失败")
    except Exception as e:
        print(f"测试2通过：依赖未满足时返回错误 - {str(e)}")
    
    # 测试3：先执行依赖技能，再执行目标技能（应该成功）
    project3 = Project(name="测试项目3")
    # 添加一个源文件，这样 parse_requirements 会返回非空的需求列表
    from deepbs_common.schemas import SourceFile, FileType
    project3.source_files.append(SourceFile(file_name="招标文件.txt", file_type=FileType.tender, object_key="tender.txt"))
    try:
        # 先执行依赖技能
        parse_result = await skill_manager.execute_skill("parse_requirements", project3, {})
        project3 = parse_result.get("project", project3)
        # 再执行目标技能
        result = await skill_manager.execute_skill("plan_outline", project3, {})
        assert result is not None
        print("测试3通过：依赖满足时执行成功")
    except Exception as e:
        pytest.fail(f"测试3失败：依赖满足时执行失败 - {str(e)}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_skill_dependencies())
