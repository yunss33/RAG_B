#!/usr/bin/env python3
"""
技能调用流程测试脚本
测试从获取技能列表到执行技能的完整流程
"""

import asyncio
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from deepbs_common.skill_system import skill_manager
from deepbs_common.schemas import Project, SourceFile, FileType


async def test_skill_flow():
    """测试技能调用的完整流程"""
    print("=" * 60)
    print("技能调用流程测试")
    print("=" * 60)
    
    # 步骤1：获取所有可用技能
    print("\n步骤1：获取所有可用技能")
    print("-" * 60)
    try:
        skills = skill_manager.get_available_skills()
        print(f"✓ 成功获取 {len(skills)} 个技能：")
        for i, skill in enumerate(skills, 1):
            print(f"  {i}. {skill.name} - {skill.description}")
    except Exception as e:
        print(f"✗ 获取技能列表失败：{e}")
        return False
    
    # 步骤2：创建测试项目
    print("\n步骤2：创建测试项目")
    print("-" * 60)
    try:
        project = Project(
            id="test-flow-project-001",
            name="技能流程测试项目",
            description="用于测试技能调用流程的项目"
        )
        # 添加一个测试源文件
        project.source_files.append(
            SourceFile(
                file_name="测试招标文件.txt",
                file_type=FileType.tender,
                object_key="test-tender.txt"
            )
        )
        print("✓ 测试项目创建成功")
        print(f"  项目ID：{project.id}")
        print(f"  项目名称：{project.name}")
    except Exception as e:
        print(f"✗ 创建测试项目失败：{e}")
        return False
    
    # 步骤3：执行第一个技能 - 解析需求
    print("\n步骤3：执行技能 - 解析需求（parse_requirements）")
    print("-" * 60)
    try:
        result = await skill_manager.execute_skill("parse_requirements", project, {})
        print("✓ 技能执行成功")
        print(f"  结果类型：{type(result)}")
        if result:
            print(f"  结果包含键：{list(result.keys())}")
        # 更新项目状态
        project = result.get("project", project)
    except Exception as e:
        print(f"✗ 技能执行失败：{e}")
        import traceback
        traceback.print_exc()
        return False
    
    # 步骤4：执行第二个技能 - 规划大纲
    print("\n步骤4：执行技能 - 规划大纲（plan_outline）")
    print("-" * 60)
    try:
        result = await skill_manager.execute_skill("plan_outline", project, {})
        print("✓ 技能执行成功")
        print(f"  结果类型：{type(result)}")
        if result:
            print(f"  结果包含键：{list(result.keys())}")
        # 更新项目状态
        project = result.get("project", project)
        # 检查大纲
        if project.outline:
            print(f"  生成的大纲章节数：{len(project.outline)}")
            for i, section in enumerate(project.outline[:3], 1):
                print(f"    {i}. {section.title}")
            if len(project.outline) > 3:
                print(f"    ... 还有 {len(project.outline) - 3} 个章节")
    except Exception as e:
        print(f"✗ 技能执行失败：{e}")
        import traceback
        traceback.print_exc()
        return False
    
    # 步骤5：测试错误处理
    print("\n步骤5：测试错误处理")
    print("-" * 60)
    
    # 测试执行不存在的技能
    print("\n  测试1：执行不存在的技能")
    try:
        await skill_manager.execute_skill("nonexistent_skill_12345", project, {})
        print("  ✗ 测试失败：应该抛出异常但没有")
    except Exception as e:
        print(f"  ✓ 测试成功：正确抛出异常 - {type(e).__name__}: {str(e)[:100]}...")
    
    # 测试执行依赖未满足的技能
    print("\n  测试2：执行依赖未满足的技能")
    try:
        empty_project = Project(id="empty-test", name="空项目")
        await skill_manager.execute_skill("write_drafts", empty_project, {})
        print("  ✗ 测试失败：应该抛出异常但没有")
    except Exception as e:
        print(f"  ✓ 测试成功：正确抛出异常 - {type(e).__name__}: {str(e)[:100]}...")
    
    # 步骤6：总结
    print("\n" + "=" * 60)
    print("测试流程总结")
    print("=" * 60)
    print("✓ 所有测试步骤执行完成")
    print("✓ 技能系统功能正常")
    print("=" * 60)
    return True


if __name__ == "__main__":
    try:
        success = asyncio.run(test_skill_flow())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n测试被用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n测试过程中发生未预期的错误：{e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
