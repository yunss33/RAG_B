import asyncio
from deepbs_common.skill_system import skill_manager
from deepbs_common.schemas import Project


async def test_new_skills():
    """测试新添加的技能"""
    
    # 创建测试项目
    project = Project(name="测试项目")
    
    # 1. 检查技能是否已注册
    available_skills = skill_manager.get_available_skills()
    skill_names = [skill.name for skill in available_skills]
    
    print("=== 可用技能列表 ===")
    for skill in available_skills:
        print(f"- {skill.name}: {skill.description}")
    print()
    
    # 2. 检查新技能是否在列表中
    assert "web_devtools" in skill_names, "web_devtools 技能未注册"
    assert "jinhui_stack_debug" in skill_names, "jinhui_stack_debug 技能未注册"
    print("✓ 新技能已成功注册")
    print()
    
    # 3. 测试执行 web_devtools 技能
    print("=== 测试执行 web_devtools 技能 ===")
    try:
        result = await skill_manager.execute_skill("web_devtools", project, {"url": "https://example.com"})
        print(f"✓ 执行成功")
        print(f"  结果: {result['result']}")
    except Exception as e:
        print(f"✗ 执行失败: {str(e)}")
    print()
    
    # 4. 测试执行 jinhui_stack_debug 技能
    print("=== 测试执行 jinhui_stack_debug 技能 ===")
    try:
        result = await skill_manager.execute_skill("jinhui_stack_debug", project, {"issue_type": "frontend"})
        print(f"✓ 执行成功")
        print(f"  结果: {result['result']}")
    except Exception as e:
        print(f"✗ 执行失败: {str(e)}")
    print()
    
    # 5. 测试技能推荐
    print("=== 测试技能推荐 ===")
    recommendations = skill_manager.recommend_skills(project)
    print("推荐的技能:")
    for rec in recommendations:
        print(f"- {rec['skill_name']}: {rec['reason']}")
    print()
    
    print("所有测试完成！")


if __name__ == "__main__":
    asyncio.run(test_new_skills())