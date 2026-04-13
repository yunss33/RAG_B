#!/usr/bin/env python3
"""
直接测试multimodal-embedding-v1模型
"""

import dashscope

# 设置API密钥
dashscope.api_key = "sk-e0a3c05a49d444d79967e67cc5d1a2a9"

def test_multimodal_embedding():
    """测试multimodal-embedding-v1模型"""
    print("测试multimodal-embedding-v1模型...")
    
    # 测试文本输入 - 使用正确的格式
    print("\n1. 测试文本输入:")
    try:
        resp = dashscope.MultiModalEmbedding.call(
            model="multimodal-embedding-v1",
            input=[
                {"text": "测试文本"}
            ]
        )
        print(f"   状态码: {resp.status_code}")
        if resp.status_code == 200:
            print(f"   ✓ 成功！向量维度: {len(resp.output['embeddings'][0]['embedding'])}")
            print(f"   ✓ 向量前5个值: {resp.output['embeddings'][0]['embedding'][:5]}")
            return True
        else:
            print(f"   ✗ 失败: {resp}")
            return False
    except Exception as e:
        print(f"   ✗ 异常: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_multimodal_embedding()
