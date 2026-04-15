#!/usr/bin/env python3
"""直接测试技能执行流程，不通过前端"""

import asyncio
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.deepbs_common.skill_system import skill_manager
from src.deepbs_common.schemas import Project

async def test_skill_flow():
    """测试完整的技能执行流程"""
    print("=" * 60)
    print("测试技能执行流程")
    print("=" * 60)
    
    # 1. 创建测试项目
    print("\n[1/5] 创建测试项目...")
    project = Project(
        id="test-project-1",
        name="测试项目",
        description="这是一个测试项目，用于测试技能执行流程",
        outline=[],
        outline_confirmed=False,
        config={
            "enable_image_insertion": True,
            "enable_rag": True,
        },
        source_files=[]
    )
    print(f"✓ 项目创建成功: {project.name}")
    print(f"  - outline: {project.outline}")
    print(f"  - outline_confirmed: {project.outline_confirmed}")
    
    # 2. 执行parse_requirements
    print("\n[2/5] 执行parse_requirements...")
    try:
        result = await skill_manager.execute_skill("parse_requirements", project, {})
        project = result["project"]
        print(f"✓ parse_requirements执行成功")
        print(f"  - 需求数量: {len(project.requirements)}")
    except Exception as e:
        print(f"✗ parse_requirements执行失败: {e}")
        return
    
    # 3. 执行plan_outline
    print("\n[3/5] 执行plan_outline...")
    try:
        result = await skill_manager.execute_skill("plan_outline", project, {})
        project = result["project"]
        print(f"✓ plan_outline执行成功")
        print(f"  - 章节数量: {len(project.outline)}")
        print(f"  - 章节详情:")
        for section in project.outline:
            print(f"    - {section.title} (confirmed: {section.confirmed})")
    except Exception as e:
        print(f"✗ plan_outline执行失败: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # 4. 执行write_drafts
    print("\n[4/5] 执行write_drafts...")
    try:
        result = await skill_manager.execute_skill("write_drafts", project, {})
        project = result["project"]
        print(f"✓ write_drafts执行成功")
        print(f"  - 草稿数量: {len(project.drafts)}")
    except Exception as e:
        print(f"✗ write_drafts执行失败: {e}")
        import traceback
        traceback.print_exc()
        return
    
    print("\n" + "=" * 60)
    print("✓ 所有技能执行成功！")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_skill_flow())
