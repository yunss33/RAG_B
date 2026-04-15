from deepbs_common import qdrant_manager

print("Testing Qdrant integration...")

# 初始化Qdrant客户端
print("Initializing Qdrant client...")
client = qdrant_manager.initialize()
print(f"Qdrant client initialized: {client}")

# 测试连接
print("Testing Qdrant connection...")
try:
    collections = client.get_collections()
    print(f"Connection successful! Collections: {[col.name for col in collections.collections]}")
except Exception as e:
    print(f"Connection failed: {e}")

# 创建向量集合
print("Creating vector collection...")
try:
    result = qdrant_manager.create_collection()
    print(f"Collection creation result: {result}")
except Exception as e:
    print(f"Collection creation failed: {e}")

print("Qdrant integration test completed.")
