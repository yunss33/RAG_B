import asyncio
from deepbs_common.langgraph_workflow import run_agent_workflow
from deepbs_common.schemas import Project, SourceFile

async def test_workflow():
    # 创建测试项目
    project = Project(
        id="test-1",
        name="测试项目",
        description="测试langgraph工作流",
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
        drafts=[],
        review_issues=[],
        image_suggestions=[],
        image_selections=[],
        evidence_items=[]
    )
    
    print("Testing parse requirements...")
    result = await run_agent_workflow(project, "parse")
    print(f"Parse result: {result['result']}")
    
    print("\nTesting plan outline...")
    result = await run_agent_workflow(project, "plan")
    print(f"Plan result: {result['result']}")
    
    print("\nTesting write drafts...")
    result = await run_agent_workflow(project, "write")
    print(f"Write result: {result['result']}")

if __name__ == "__main__":
    asyncio.run(test_workflow())
