from deepbs_common.skill_system import PlanOutlineSkill
from deepbs_common.schemas import Project, SourceFile, FileType

async def test_outline_questions():
    """测试大纲规划技能生成的问题是否正确"""
    # 创建测试项目
    project = Project(name="测试项目")
    project.source_files.append(
        SourceFile(file_name="招标文件.txt", file_type=FileType.tender, object_key="tender.txt")
    )
    project.source_files.append(
        SourceFile(file_name="企业资质.txt", file_type=FileType.knowledge, object_key="company.txt")
    )
    project.source_files.append(
        SourceFile(file_name="产品图片.png", file_type=FileType.image, object_key="image.png")
    )
    
    # 创建大纲规划技能实例
    skill = PlanOutlineSkill()
    
    # 执行技能
    result = await skill.execute(project, {})
    
    # 验证结果
    assert "result" in result
    assert "project" in result
    assert "outline" in result["result"]
    assert "questions" in result["result"]
    
    # 验证大纲结构
    outline = result["result"]["outline"]
    assert len(outline) == 4
    
    # 验证问题生成
    questions = result["result"]["questions"]
    print(f"生成的问题数量: {len(questions)}")
    
    # 验证章节确认问题
    section_questions = [q for q in questions if q["type"] == "section_confirmation"]
    assert len(section_questions) == 4  # 4个章节，每个章节一个确认问题
    
    # 验证图片插入问题
    image_questions = [q for q in questions if q["type"] == "image_insertion"]
    assert len(image_questions) == 1  # 有图片文件，应该生成一个图片插入问题
    
    # 验证知识库信息获取问题
    rag_questions = [q for q in questions if q["type"] == "rag_source"]
    assert len(rag_questions) == 1  # 有知识文件，应该生成一个知识库信息获取问题
    
    # 打印所有问题
    print("\n生成的问题:")
    for i, question in enumerate(questions):
        print(f"\n问题 {i+1}:")
        print(f"ID: {question['id']}")
        print(f"类型: {question['type']}")
        if 'section_title' in question:
            print(f"章节标题: {question['section_title']}")
        print(f"问题: {question['question']}")
        print(f"选项: {question['options']}")
        print(f"是否必填: {question['required']}")
    
    print("\n测试通过！")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_outline_questions())
