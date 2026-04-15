#!/usr/bin/env python3
"""
测试 qwen3.5-27b 模型连接测试
"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from deepbs_common.llm import llm_provider

async def test_model():
    print("=" * 60)
    print("测试 qwen3.5-27b 模型连接测试")
    print("=" * 60)
    
    print(f"\n当前配置的模型名称: {llm_provider.model_name}")
    print(f"API密钥已配置: {'是' if llm_provider.api_key else '否'}")
    
    print("\n测试 1: 简单文本生成")
    print("-" * 40)
    try:
        result = await llm_provider.generate("你好，请用一句话介绍自己。")
        print(f"✓ 成功!")
        print(f"结果: {result}")
    except Exception as e:
        print(f"✗ 失败: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("\n测试 2: 结构化生成")
    print("-" * 40)
    try:
        result = await llm_provider.structured_generate(
            "请生成一个简单的项目大纲，包括3个章节",
            "test_schema"
        )
        print(f"✓ 成功!")
        print(f"结果: {result}")
    except Exception as e:
        print(f"✗ 失败: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print("\n" + "=" * 60)
    print("所有测试完成!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    try:
        success = asyncio.run(test_model())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n测试被中断")
        sys.exit(1)
