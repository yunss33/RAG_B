#!/usr/bin/env python3
"""
测试 LLM 连接 - qwen-plus 模型
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from deepbs_common.llm import DashscopeLLMProvider
from deepbs_common.settings import Settings


async def test_llm_connection():
    print("=" * 60)
    print("LLM 连接测试")
    print("=" * 60)
    print()
    
    settings = Settings(_env_file='.env', _env_file_encoding='utf-8')
    
    print(f"当前配置:")
    print(f"  模型名称: {settings.model_name}")
    print(f"  API密钥: {settings.dashscope_api_key[:10]}...")
    print()
    
    print("1. 测试 LLM 初始化...")
    try:
        llm_provider = DashscopeLLMProvider(model_name=settings.model_name, api_key=settings.dashscope_api_key)
        print(f"   ✓ LLM 提供者类型: {type(llm_provider).__name__}")
        if hasattr(llm_provider, 'model_name'):
            print(f"   ✓ 模型: {llm_provider.model_name}")
    except Exception as e:
        print(f"   ✗ 初始化失败: {e}")
        return False
    
    print()
    print("2. 测试简单文本生成...")
    test_prompt = "你好，请介绍一下你自己，限制在50字以内。"
    print(f"   提示词: {test_prompt}")
    
    try:
        response = await llm_provider.generate(test_prompt)
        print(f"   ✓ 响应: {response}")
    except Exception as e:
        print(f"   ✗ 生成失败: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print()
    print("3. 测试结构化生成...")
    try:
        struct_response = await llm_provider.structured_generate(
            "请列出3种水果",
            "fruit_list"
        )
        print(f"   ✓ 结构化响应: {struct_response}")
    except Exception as e:
        print(f"   ✗ 结构化生成失败: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print()
    print("4. 测试 Embedding...")
    try:
        embeddings = await llm_provider.embed(["测试文本1", "测试文本2"])
        print(f"   ✓ Embedding 数量: {len(embeddings)}")
        if embeddings:
            print(f"   ✓ 向量维度: {len(embeddings[0])}")
    except Exception as e:
        print(f"   ✗ Embedding 失败: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print()
    print("=" * 60)
    print("✅ 所有测试通过！LLM 连接正常。")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = asyncio.run(test_llm_connection())
    sys.exit(0 if success else 1)