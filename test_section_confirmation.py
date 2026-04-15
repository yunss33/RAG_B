import asyncio
from deepbs_common.langgraph_workflow import run_agent_workflow
from deepbs_common.skill_system import skill_manager
from deepbs_common.schemas import Project, SourceFile

async def test_section_confirmation():
    # 创建测试项目
    project = Project(
        id="test-2",
        name="测试项目",
        description="测试章节级大纲确认机制",
        source_files=[
            SourceFile(
                id="file-1",
                file_name="test-tender.txt",
                file_type="tender",
                object_key="test-tender.txt",
                size=1024,
                upload_time="2026-04-13T00:00:00Z"
            )
        ],
        requirements=[],
        outline=[],
        outline_confirmed=False,
        drafts=[],
        review_issues=[],
        image_suggestions=[],
        image_selections=[],
        evidence_items=[]
    )
    
    print("Step 1: 执行需求解析...")
    result = await run_agent_workflow(project, "parse")
    print(f"需求解析完成，提取了 {len(result['project'].requirements)} 个需求")
    
    print("\nStep 2: 执行大纲规划...")
    result = await run_agent_workflow(project, "plan")
    project = result['project']
    print(f"大纲规划完成，创建了 {len(project.outline)} 个章节")
    print(f"大纲确认状态: {project.outline_confirmed}")
    for section in project.outline:
        print(f"  章节 {section.title}: 确认状态 = {section.confirmed}")
    
    print("\nStep 3: 只确认部分章节...")
    # 只确认第一个章节
    project.outline[0].confirmed = True
    print(f"大纲确认状态: {project.outline_confirmed}")
    for section in project.outline:
        print(f"  章节 {section.title}: 确认状态 = {section.confirmed}")
    
    print("\nStep 4: 尝试在部分章节未确认时执行内容生成...")
    try:
        result = await run_agent_workflow(project, "write")
        print("错误：应该失败但成功了！")
    except Exception as e:
        print(f"预期的失败: {str(e)}")
    
    print("\nStep 5: 确认所有章节...")
    # 确认所有章节
    for section in project.outline:
        section.confirmed = True
    # 系统应该自动设置project.outline_confirmed为True
    print(f"大纲确认状态: {project.outline_confirmed}")
    for section in project.outline:
        print(f"  章节 {section.title}: 确认状态 = {section.confirmed}")
    
    print("\nStep 6: 执行内容生成...")
    result = await run_agent_workflow(project, "write")
    print(f"内容生成完成，创建了 {len(result['project'].drafts)} 个草稿章节")
    
    print("\n测试完成！")

if __name__ == "__main__":
    asyncio.run(test_section_confirmation())
