import os
import shutil
import tempfile
import unittest
from pathlib import Path

from deepbs_common.repository import ProjectRepository
from deepbs_common.schemas import Project


class TestProjectRepository(unittest.TestCase):
    def setUp(self):
        # 创建临时目录用于测试
        self.temp_dir = tempfile.mkdtemp()
        self.repository = ProjectRepository(data_dir=self.temp_dir)
    
    def tearDown(self):
        # 清理临时目录
        shutil.rmtree(self.temp_dir)
    
    def test_create_project(self):
        # 测试创建项目
        project = Project(name="Test Project", description="Test Description")
        created_project = self.repository.create_project(project)
        self.assertEqual(created_project.name, "Test Project")
        self.assertEqual(created_project.description, "Test Description")
        
        # 验证项目文件是否被创建
        project_path = Path(self.temp_dir) / "projects" / f"{project.id}.json"
        self.assertTrue(project_path.exists())
    
    def test_get_project(self):
        # 测试获取项目
        project = Project(name="Test Project", description="Test Description")
        self.repository.create_project(project)
        
        retrieved_project = self.repository.get_project(project.id)
        self.assertEqual(retrieved_project.id, project.id)
        self.assertEqual(retrieved_project.name, "Test Project")
    
    def test_get_nonexistent_project(self):
        # 测试获取不存在的项目
        with self.assertRaises(FileNotFoundError):
            self.repository.get_project("non-existent-id")
    
    def test_save_project(self):
        # 测试保存项目
        project = Project(name="Test Project", description="Test Description")
        self.repository.create_project(project)
        
        # 修改项目
        project.name = "Updated Project"
        updated_project = self.repository.save_project(project)
        self.assertEqual(updated_project.name, "Updated Project")
        
        # 验证修改是否生效
        retrieved_project = self.repository.get_project(project.id)
        self.assertEqual(retrieved_project.name, "Updated Project")
    
    def test_list_projects(self):
        # 测试列出项目
        # 创建两个项目
        project1 = Project(name="Project 1")
        project2 = Project(name="Project 2")
        self.repository.create_project(project1)
        self.repository.create_project(project2)
        
        # 获取项目列表
        projects = self.repository.list_projects()
        self.assertEqual(len(projects), 2)
        project_names = [p.name for p in projects]
        self.assertIn("Project 1", project_names)
        self.assertIn("Project 2", project_names)


if __name__ == "__main__":
    unittest.main()
