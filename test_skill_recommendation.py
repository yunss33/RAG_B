from deepbs_common.skill_system import skill_manager
from deepbs_common.schemas import Project

# 测试技能推荐功能
def test_skill_recommendation():
    print('Testing skill recommendation functionality...')
    
    # 测试1：空项目（无需求）
    project1 = Project(name="Test Project 1", description="Test project with no requirements")
    recommendations1 = skill_manager.recommend_skills(project1)
    print('\nRecommendations for project with no requirements:')
    for rec in recommendations1:
        print(f'  - {rec["skill_name"]}: {rec["reason"]}')
    
    # 测试2：有需求但无大纲
    project2 = Project(name="Test Project 2", description="Test project with requirements")
    project2.requirements = ["Requirement 1", "Requirement 2"]
    recommendations2 = skill_manager.recommend_skills(project2)
    print('\nRecommendations for project with requirements but no outline:')
    for rec in recommendations2:
        print(f'  - {rec["skill_name"]}: {rec["reason"]}')
    
    # 测试3：有大纲但无草稿
    project3 = Project(name="Test Project 3", description="Test project with outline")
    project3.requirements = ["Requirement 1"]
    project3.outline = [{"id": "1", "title": "Section 1"}]
    recommendations3 = skill_manager.recommend_skills(project3)
    print('\nRecommendations for project with outline but no drafts:')
    for rec in recommendations3:
        print(f'  - {rec["skill_name"]}: {rec["reason"]}')
    
    # 测试4：有草稿（完整项目）
    project4 = Project(name="Test Project 4", description="Test project with drafts")
    project4.requirements = ["Requirement 1"]
    project4.outline = [{"id": "1", "title": "Section 1"}]
    project4.drafts = [{"id": "1", "content": "Draft content"}]
    recommendations4 = skill_manager.recommend_skills(project4)
    print('\nRecommendations for project with drafts:')
    for rec in recommendations4:
        print(f'  - {rec["skill_name"]}: {rec["reason"]}')
    
    # 测试5：有草稿和源文件
    project5 = Project(name="Test Project 5", description="Test project with drafts and source files")
    project5.requirements = ["Requirement 1"]
    project5.outline = [{"id": "1", "title": "Section 1"}]
    project5.drafts = [{"id": "1", "content": "Draft content"}]
    project5.source_files = [{"file_name": "test.pdf", "file_type": "tender"}]
    recommendations5 = skill_manager.recommend_skills(project5)
    print('\nRecommendations for project with drafts and source files:')
    for rec in recommendations5:
        print(f'  - {rec["skill_name"]}: {rec["reason"]}')

if __name__ == "__main__":
    test_skill_recommendation()
