#!/usr/bin/env python3
"""
测试不同的 qwen 模型名称
"""
import dashscope

dashscope.api_key = "sk-e0a3c05a49d444d79967e67cc5d1a2a9"

models_to_test = [
    "qwen3.5-27b",
    "qwen3.5-27b-instruct", 
    "qwen-plus",
    "qwen-turbo",
    "qwen-max",
    "qwen2.5-27b-instruct",
    "qwen2.5-27b",
]

print("测试不同的模型名称...")
print()

for model_name in models_to_test:
    print(f"测试模型: {model_name}")
    try:
        resp = dashscope.Generation.call(
            model=model_name,
            prompt="你好",
        )
        if resp.status_code == 200:
            print(f"  ✓ 成功！响应: {resp.output.text[:50]}")
        else:
            print(f"  ✗ 失败: {resp.message}")
    except Exception as e:
        print(f"  ✗ 异常: {e}")
    print()