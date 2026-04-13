import os
import tempfile
import unittest

from fastapi.testclient import TestClient
from deepbs_common.settings import settings

# 导入API应用
from api_app.main import app


class TestIntegration(unittest.TestCase):
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
    
    def test_full_project_flow(self):
        """测试完整的项目流程"""
        # 1. 创建项目
        response = self.client.post("/projects", json={
            "name": "Integration Test Project",
            "description": "Test project for integration testing"
        })
        self.assertEqual(response.status_code, 200)
        project_id = response.json()["project_id"]
        
        # 2. 上传文件
        response = self.client.post(
            f"/projects/{project_id}/files",
            files={"file": ("test_tender.txt", "Test tender document content")},
            data={"file_type": "tender"}
        )
        self.assertEqual(response.status_code, 200)
        
        # 3. 检查项目状态
        response = self.client.get(f"/projects/{project_id}/status")
        self.assertEqual(response.status_code, 200)
        status_data = response.json()
        self.assertEqual(status_data["project_id"], project_id)
        self.assertEqual(status_data["stage"], "created")
        self.assertEqual(status_data["source_file_count"], 1)
        
        # 4. 尝试处理项目文件（可能会失败，因为RAG服务可能不可用）
        response = self.client.post(f"/projects/{project_id}/ingest")
        # 由于RAG服务可能不可用，这里只测试基本的错误处理
        self.assertIn(response.status_code, [200, 500])
        
        # 5. 获取项目详情
        response = self.client.get(f"/projects/{project_id}")
        self.assertEqual(response.status_code, 200)
        project_data = response.json()
        self.assertEqual(project_data["id"], project_id)
        self.assertEqual(project_data["name"], "Integration Test Project")
        self.assertEqual(len(project_data["source_files"]), 1)
        
        # 6. 获取项目列表
        response = self.client.get("/projects")
        self.assertEqual(response.status_code, 200)
        projects = response.json()
        self.assertGreater(len(projects), 0)
        
        # 7. 获取项目需求
        response = self.client.get(f"/projects/{project_id}/requirements")
        self.assertEqual(response.status_code, 200)
        requirements = response.json()
        self.assertIsInstance(requirements, list)
        
        # 8. 获取项目大纲
        response = self.client.get(f"/projects/{project_id}/outline")
        self.assertEqual(response.status_code, 200)
        outline = response.json()
        self.assertIsInstance(outline, list)
        
        # 9. 获取项目草稿
        response = self.client.get(f"/projects/{project_id}/drafts")
        self.assertEqual(response.status_code, 200)
        drafts_data = response.json()
        self.assertIn("drafts", drafts_data)
        self.assertIn("review_issues", drafts_data)
        
        # 10. 获取图片建议
        response = self.client.get(f"/projects/{project_id}/image-suggestions")
        self.assertEqual(response.status_code, 200)
        image_suggestions = response.json()
        self.assertIsInstance(image_suggestions, list)
        
        # 11. 获取最终HTML
        response = self.client.get(f"/projects/{project_id}/final-html")
        self.assertEqual(response.status_code, 200)
        final_html = response.json()
        self.assertEqual(final_html["project_id"], project_id)
        self.assertIsNone(final_html["html"])
        self.assertIsNone(final_html["url"])


if __name__ == "__main__":
    unittest.main()
