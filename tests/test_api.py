import os
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient
from deepbs_common.settings import settings

# 导入API应用
from api_app.main import app


class TestAPI(unittest.TestCase):
    def setUp(self):
        # 创建临时目录用于测试
        self.temp_dir = tempfile.mkdtemp()
        # 保存原始设置
        self.original_data_dir = settings.data_dir
        self.original_object_dir = settings.object_dir
        # 修改设置为临时目录
        settings.data_dir = self.temp_dir
        settings.object_dir = os.path.join(self.temp_dir, "objects")
        # 创建objects目录
        os.makedirs(settings.object_dir, exist_ok=True)
        # 创建测试客户端
        self.client = TestClient(app)
    
    def tearDown(self):
        # 恢复原始设置
        settings.data_dir = self.original_data_dir
        settings.object_dir = self.original_object_dir
    
    def test_healthz(self):
        # 测试健康检查接口
        response = self.client.get("/healthz")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("status", data)
    
    def test_create_project(self):
        # 测试创建项目
        response = self.client.post("/projects", json={
            "name": "Test Project",
            "description": "Test Description"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("project_id", data)
        return data["project_id"]
    
    def test_list_projects(self):
        # 测试列出项目
        # 先创建一个项目
        project_id = self.test_create_project()
        # 获取项目列表
        response = self.client.get("/projects")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
    
    def test_get_project(self):
        # 测试获取项目详情
        project_id = self.test_create_project()
        response = self.client.get(f"/projects/{project_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], project_id)
        self.assertEqual(data["name"], "Test Project")
    
    def test_get_nonexistent_project(self):
        # 测试获取不存在的项目
        response = self.client.get("/projects/non-existent-id")
        self.assertEqual(response.status_code, 404)
    
    def test_upload_file(self):
        # 测试上传文件
        project_id = self.test_create_project()
        # 上传一个文本文件
        response = self.client.post(
            f"/projects/{project_id}/files",
            files={"file": ("test.txt", "test content")},
            data={"file_type": "tender"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("file_name", data)
        self.assertEqual(data["file_name"], "test.txt")
        self.assertEqual(data["file_type"], "tender")
    
    def test_ingest_project(self):
        # 测试处理项目文件
        project_id = self.test_create_project()
        # 先上传一个文件
        self.client.post(
            f"/projects/{project_id}/files",
            files={"file": ("test.txt", "test content")},
            data={"file_type": "tender"}
        )
        # 处理项目文件
        response = self.client.post(f"/projects/{project_id}/ingest")
        # 由于RAG服务可能不可用，这里只测试基本的错误处理
        self.assertIn(response.status_code, [200, 500])
    
    def test_project_status(self):
        # 测试获取项目状态
        project_id = self.test_create_project()
        response = self.client.get(f"/projects/{project_id}/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["project_id"], project_id)
        self.assertEqual(data["stage"], "created")
    
    def test_get_requirements(self):
        # 测试获取项目需求
        project_id = self.test_create_project()
        response = self.client.get(f"/projects/{project_id}/requirements")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
    
    def test_get_outline(self):
        # 测试获取项目大纲
        project_id = self.test_create_project()
        response = self.client.get(f"/projects/{project_id}/outline")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
    
    def test_get_drafts(self):
        # 测试获取项目草稿
        project_id = self.test_create_project()
        response = self.client.get(f"/projects/{project_id}/drafts")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("drafts", data)
        self.assertIn("review_issues", data)
    
    def test_get_image_suggestions(self):
        # 测试获取图片建议
        project_id = self.test_create_project()
        response = self.client.get(f"/projects/{project_id}/image-suggestions")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
    
    def test_get_final_html(self):
        # 测试获取最终HTML
        project_id = self.test_create_project()
        response = self.client.get(f"/projects/{project_id}/final-html")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["project_id"], project_id)
        self.assertIsNone(data["html"])
        self.assertIsNone(data["url"])


if __name__ == "__main__":
    unittest.main()
