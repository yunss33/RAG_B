#!/usr/bin/env python3
"""
测试langchain和阿里百炼的嵌入模型
"""

import sys
from pathlib import Path

# 添加项目根目录到路径
sys.path.insert(0, str(Path(__file__).parent))

from deepbs_common.embedding import embedding_manager

def test_embedding():
    """测试嵌入模型"""
    print("测试langchain和阿里百炼的嵌入模型...")
    
    # 测试单个文本的嵌入
    print("\n1. 测试单个文本的嵌入:")
    test_text = "这是一个测试文本，用于验证嵌入模型是否正常工作。"
    try:
        embedding = embedding_manager.get_embedding(test_text)
        print(f"   ✓ 成功生成嵌入向量")
        print(f"   ✓ 向量维度: {len(embedding)}")
        print(f"   ✓ 向量前5个值: {embedding[:5]}")
    except Exception as e:
        print(f"   ✗ 生成嵌入失败: {e}")
        return False
    
    # 测试批量文本的嵌入
    print("\n2. 测试批量文本的嵌入:")
    test_texts = [
        "第一个测试文本",
        "第二个测试文本",
        "第三个测试文本"
    ]
    try:
        embeddings = embedding_manager.get_embeddings(test_texts)
        print(f"   ✓ 成功生成批量嵌入向量")
        print(f"   ✓ 生成的向量数量: {len(embeddings)}")
        for i, emb in enumerate(embeddings):
            print(f"   ✓ 文本{i+1}向量维度: {len(emb)}")
    except Exception as e:
        print(f"   ✗ 批量生成嵌入失败: {e}")
        return False
    
    # 测试向量维度
    print("\n3. 测试向量维度:")
    try:
        vector_size = embedding_manager.get_vector_size()
        print(f"   ✓ 向量维度: {vector_size}")
    except Exception as e:
        print(f"   ✗ 获取向量维度失败: {e}")
        return False
    
    print("\n🎉 所有测试通过！langchain和阿里百炼的嵌入模型工作正常。")
    return True

if __name__ == "__main__":
    test_embedding()
