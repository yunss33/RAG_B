from qdrant_client import QdrantClient
from qdrant_client.http.models import VectorParams, Distance, PointStruct
from .settings import settings


class QdrantManager:
    def __init__(self):
        self.client = None
    
    def initialize(self):
        """初始化Qdrant客户端"""
        self.client = QdrantClient(
            host=settings.qdrant_host,
            port=settings.qdrant_port,
            api_key=settings.qdrant_api_key
        )
        return self.client
    
    def get_client(self):
        """获取Qdrant客户端实例"""
        if self.client is None:
            self.initialize()
        return self.client
    
    def create_collection(self, collection_name: str = None, vector_size: int = 768):
        """创建向量集合"""
        collection_name = collection_name or settings.qdrant_collection_name
        client = self.get_client()
        
        # 检查集合是否存在
        collections = client.get_collections()
        collection_names = [col.name for col in collections.collections]
        
        if collection_name not in collection_names:
            client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=vector_size,
                    distance=Distance.COSINE
                )
            )
            return f"Collection {collection_name} created successfully"
        else:
            return f"Collection {collection_name} already exists"
    
    def delete_collection(self, collection_name: str = None):
        """删除向量集合"""
        collection_name = collection_name or settings.qdrant_collection_name
        client = self.get_client()
        client.delete_collection(collection_name=collection_name)
        return f"Collection {collection_name} deleted successfully"
    
    def upsert_vectors(self, points, collection_name: str = None):
        """添加或更新向量"""
        collection_name = collection_name or settings.qdrant_collection_name
        client = self.get_client()
        client.upsert(
            collection_name=collection_name,
            points=points
        )
        return f"Upserted {len(points)} vectors successfully"
    
    def search_vectors(self, query_vector, limit: int = 5, collection_name: str = None, filter_conditions=None):
        """搜索向量"""
        collection_name = collection_name or settings.qdrant_collection_name
        client = self.get_client()
        return client.search(
            collection_name=collection_name,
            query_vector=query_vector,
            limit=limit,
            filter=filter_conditions
        )


# 创建全局Qdrant管理器实例
qdrant_manager = QdrantManager()
