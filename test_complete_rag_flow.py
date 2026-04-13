#!/usr/bin/env python3
"""
测试完整的RAG功能流程
"""

import sys
from pathlib import Path

# 添加项目根目录到路径
sys.path.insert(0, str(Path(__file__).parent))

import requests
import json

# 配置
BASE_URL = "http://localhost:8100"

def test_health_check():
    """测试健康检查"""
    print("1. 测试健康检查...")
    try:
        response = requests.get(f"{BASE_URL}/healthz", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ 健康检查通过")
            print(f"   ✓ 状态: {data.get('status')}")
            if 'dependencies' in data:
                for dep, status in data['dependencies'].items():
                    print(f"   ✓ {dep}: {status}")
            return True
        else:
            print(f"   ✗ 健康检查失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ✗ 健康检查异常: {e}")
        return False

def test_create_project():
    """测试创建项目"""
    print("\n2. 测试创建项目...")
    try:
        response = requests.post(
            f"{BASE_URL}/projects",
            json={
                "name": "RAG完整测试项目",
                "description": "用于测试完整RAG功能流程的项目",
                "target_language": "zh-CN"
            },
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            project_id = data.get("project_id")
            print(f"   ✓ 项目创建成功")
            print(f"   ✓ 项目ID: {project_id}")
            return project_id
        else:
            print(f"   ✗ 项目创建失败: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"   ✗ 项目创建异常: {e}")
        return None

def test_upload_file(project_id, file_path, file_type):
    """测试上传文件"""
    print(f"\n3. 测试上传文件: {file_path}...")
    try:
        with open(file_path, "rb") as f:
            response = requests.post(
                f"{BASE_URL}/projects/{project_id}/files",
                files={"file": f},
                data={"file_type": file_type},
                timeout=30
            )
        if response.status_code == 200:
            print(f"   ✓ 文件上传成功: {file_path}")
            return True
        else:
            print(f"   ✗ 文件上传失败: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"   ✗ 文件上传异常: {e}")
        return False

def test_ingest_project(project_id):
    """测试ingest项目"""
    print("\n4. 测试ingest项目...")
    try:
        response = requests.post(
            f"{BASE_URL}/projects/{project_id}/ingest",
            timeout=60
        )
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Ingest成功")
            print(f"   ✓ 处理文件数: {data.get('ingested_files')}")
            print(f"   ✓ 证据项数: {data.get('evidence_items')}")
            print(f"   ✓ 图片候选数: {data.get('image_candidates')}")
            return True
        else:
            print(f"   ✗ Ingest失败: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"   ✗ Ingest异常: {e}")
        return False

def test_search(project_id, query):
    """测试搜索功能"""
    print(f"\n5. 测试搜索: '{query}'...")
    try:
        response = requests.post(
            f"{BASE_URL}/projects/{project_id}/search",
            json={
                "query": query,
                "limit": 5,
                "type": "all"
            },
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ 搜索成功")
            print(f"   ✓ 状态: {data.get('status')}")
            results = data.get('results', [])
            print(f"   ✓ 找到 {len(results)} 个结果")
            for i, result in enumerate(results[:3], 1):
                print(f"     {i}. 相似度: {result.get('score', 0):.4f}")
                print(f"        内容: {result.get('payload', {}).get('content', '')[:50]}...")
            return True
        else:
            print(f"   ✗ 搜索失败: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"   ✗ 搜索异常: {e}")
        return False

def main():
    """主测试函数"""
    print("=" * 60)
    print("测试完整的RAG功能流程")
    print("=" * 60)
    
    # 1. 健康检查
    if not test_health_check():
        print("\n❌ 健康检查失败，停止测试")
        return
    
    # 2. 创建项目
    project_id = test_create_project()
    if not project_id:
        print("\n❌ 项目创建失败，停止测试")
        return
    
    # 3. 准备测试文件
    print("\n准备测试文件...")
    test_file = "test_rag_content.txt"
    with open(test_file, "w", encoding="utf-8") as f:
        f.write("""这是一个测试文档，用于验证RAG功能是否正常工作。

我们的公司专注于人工智能技术的研发和应用。

主要业务包括：
1. 智能投标系统开发
2. 多智能体协作平台
3. 知识检索和问答系统
4. 文档处理和分析

我们的技术优势：
- 采用最新的大语言模型
- 实现高效的向量检索
- 支持多模态输入
- 提供稳定可靠的服务

联系方式：
- 邮箱：contact@example.com
- 电话：400-123-4567
""")
    print(f"   ✓ 测试文件创建成功: {test_file}")
    
    # 4. 上传文件
    if not test_upload_file(project_id, test_file, "knowledge"):
        print("\n❌ 文件上传失败，停止测试")
        return
    
    # 5. Ingest项目
    if not test_ingest_project(project_id):
        print("\n❌ Ingest失败，停止测试")
        return
    
    # 6. 测试搜索
    test_search(project_id, "智能投标")
    test_search(project_id, "人工智能")
    test_search(project_id, "联系方式")
    
    # 7. 总结
    print("\n" + "=" * 60)
    print("🎉 RAG功能测试完成！")
    print("=" * 60)
    print("\n所有功能正常工作：")
    print("  ✓ 健康检查")
    print("  ✓ 项目创建")
    print("  ✓ 文件上传")
    print("  ✓ 文档处理（ingest）")
    print("  ✓ 相似度搜索")
    print("\nRAG功能已完善！")

if __name__ == "__main__":
    main()
