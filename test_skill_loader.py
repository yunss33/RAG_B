#!/usr/bin/env python3

from src.deepbs_common.skill_loader import skill_loader

# 测试加载压缩版技能
print("Testing compressed version...")
compressed_content = skill_loader.load_superpowers_plus(compressed=True)
if compressed_content:
    print("✓ Successfully loaded compressed Superpowers Plus skill")
    print(f"  Content length: {len(compressed_content)} characters")
    print(f"  First 500 characters: {compressed_content[:500]}...")
else:
    print("✗ Failed to load compressed Superpowers Plus skill")

# 测试加载非压缩版技能
print("\nTesting regular version...")
regular_content = skill_loader.load_superpowers_plus(compressed=False)
if regular_content:
    print("✓ Successfully loaded regular Superpowers Plus skill")
    print(f"  Content length: {len(regular_content)} characters")
    print(f"  First 500 characters: {regular_content[:500]}...")
else:
    print("✗ Failed to load regular Superpowers Plus skill")

# 测试技能是否可用
print("\nTesting if Superpowers Plus is available...")
if skill_loader.is_superpowers_plus_available():
    print("✓ Superpowers Plus is available")
else:
    print("✗ Superpowers Plus is not available")
