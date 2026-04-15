#!/usr/bin/env python3
"""
测试RAG服务处理PDF和图片文件的能力
"""

import requests
import json
import os
import uuid
from pathlib import Path

# 配置
BASE_URL = "http://localhost:8100"
PROJECT_NAME = "测试RAG处理PDF和图片"

# 创建项目
def create_project():
    """创建测试项目"""
    url = f"{BASE_URL}/projects"
    data = {
        "name": PROJECT_NAME,
        "description": "测试RAG服务处理PDF和图片文件的能力",
        "target_language": "zh-CN"
    }
    response = requests.post(url, json=data)
    if response.status_code == 200:
        project_id = response.json()["project_id"]
        print(f"项目创建成功: {project_id}")
        return project_id
    else:
        print(f"项目创建失败: {response.status_code} {response.text}")
        return None

# 上传文件
def upload_file(project_id, file_path, file_type):
    """上传文件到项目"""
    url = f"{BASE_URL}/projects/{project_id}/files"
    files = {
        "file": open(file_path, "rb")
    }
    data = {
        "file_type": file_type
    }
    response = requests.post(url, files=files, data=data)
    if response.status_code == 200:
        print(f"文件上传成功: {file_path}")
        return True
    else:
        print(f"文件上传失败: {response.status_code} {response.text}")
        return False

# 执行ingest
def ingest_project(project_id):
    """执行项目的ingest操作"""
    url = f"{BASE_URL}/projects/{project_id}/ingest"
    response = requests.post(url)
    if response.status_code == 200:
        result = response.json()
        print(f"Ingest成功: {result}")
        return result
    else:
        print(f"Ingest失败: {response.status_code} {response.text}")
        return None

# 搜索
def search_project(project_id, query):
    """搜索项目中的内容"""
    url = f"{BASE_URL}/projects/{project_id}/search"
    data = {
        "query": query,
        "limit": 5,
        "type": "all"
    }
    response = requests.post(url, json=data)
    if response.status_code == 200:
        result = response.json()
        print(f"搜索结果: {result}")
        return result
    else:
        print(f"搜索失败: {response.status_code} {response.text}")
        return None

# 创建测试文件
def create_test_files():
    """创建测试文件"""
    # 创建测试文本文件
    text_content = "这是一个测试文本文件，用于测试RAG服务的文本处理能力。"
    with open("test_text.txt", "w", encoding="utf-8") as f:
        f.write(text_content)
    
    # 创建测试PDF文件
    try:
        from fpdf import FPDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt="这是一个测试PDF文件", ln=1)
        pdf.cell(200, 10, txt="用于测试RAG服务的PDF处理能力", ln=1)
        pdf.output("test_pdf.pdf")
        print("测试PDF文件创建成功")
    except Exception as e:
        print(f"PDF文件创建失败: {e}")
    
    # 创建测试图片文件
    try:
        from PIL import Image, ImageDraw, ImageFont
        img = Image.new('RGB', (200, 100), color=(255, 255, 255))
        d = ImageDraw.Draw(img)
        d.text((10, 10), "测试图片", fill=(0, 0, 0))
        d.text((10, 30), "RAG服务测试", fill=(0, 0, 0))
        img.save("test_image.png")
        print("测试图片文件创建成功")
    except Exception as e:
        print(f"图片文件创建失败: {e}")

# 主测试函数
def main():
    """主测试函数"""
    print("开始测试RAG服务处理PDF和图片文件的能力...")
    
    # 创建测试文件
    create_test_files()
    
    # 创建项目
    project_id = create_project()
    if not project_id:
        return
    
    # 上传文件
    upload_file(project_id, "test_text.txt", "knowledge")
    upload_file(project_id, "test_image.png", "image")
    
    # 执行ingest
    ingest_result = ingest_project(project_id)
    if not ingest_result:
        return
    
    # 搜索测试
    print("\n测试搜索功能...")
    search_project(project_id, "测试")
    search_project(project_id, "PDF")
    search_project(project_id, "图片")
    
    print("\n测试完成！")

if __name__ == "__main__":
    main()
