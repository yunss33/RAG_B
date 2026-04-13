#!/usr/bin/env python3
"""
测试DashScope可用的模型
"""

import os
import dashscope

# 设置API密钥
dashscope.api_key = "sk-e0a3c05a49d444d79967e67cc5d1a2a9"

def test_text_embedding():
    """测试文本嵌入"""
    print("测试DashScope文本嵌入模型...")
    
    # 测试几个可能的模型名称
    models_to_test = [
        "text-embedding-v1",
        "text-embedding-v2", 
        "text-embedding-v3",
        "multimodal-embedding-v1",
        "qwen-embedding-v1",
    ]
    
    for model_name in models_to_test:
        print(f"\n尝试模型: {model_name}")
        try:
            resp = dashscope.TextEmbedding.call(
                model=model_name,
                input="测试文本"
            )
            if resp.status_code == 200:
                print(f"  ✓ 成功！向量维度: {len(resp.output['embeddings'][0]['embedding'])}")
                return model_name
            else:
                print(f"  ✗ 失败: {resp}")
        except Exception as e:
            print(f"  ✗ 异常: {e}")
    
    return None

if __name__ == "__main__":
    working_model = test_text_embedding()
    if working_model:
        print(f"\n✅ 找到可用的模型: {working_model}")
    else:
        print("\n❌ 没有找到可用的模型")
