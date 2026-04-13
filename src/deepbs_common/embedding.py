from __future__ import annotations

from typing import List, Optional
import os
import hashlib

from langchain_community.embeddings import DashScopeEmbeddings


class EmbeddingManager:
    """Embedding模型管理器，使用langchain和阿里百炼的嵌入模型"""
    
    def __init__(self, model_name: str = "text-embedding-v1", api_key: Optional[str] = None):
        """
        初始化Embedding管理器
        
        Args:
            model_name: 使用的模型名称，默认为text-embedding-v1
            api_key: 阿里百炼的API密钥，如果为None则从环境变量DASHSCOPE_API_KEY读取
        """
        self.model_name = model_name
        self.api_key = api_key or os.getenv("DASHSCOPE_API_KEY", "sk-e0a3c05a49d444d79967e67cc5d1a2a9")
        self.embeddings = None
        self.vector_size = 1536  # text-embedding-v1的向量维度
    
    def initialize(self):
        """
        初始化Embedding模型
        """
        if self.embeddings is None:
            try:
                self.embeddings = DashScopeEmbeddings(
                    model=self.model_name,
                    dashscope_api_key=self.api_key
                )
                # 获取实际向量维度
                test_embedding = self.embeddings.embed_query("test")
                self.vector_size = len(test_embedding)
            except Exception as e:
                print(f"Warning: Failed to initialize DashScopeEmbeddings: {e}")
                print("Using local mock embedding instead")
                self.embeddings = None
        return self
    
    def get_embedding(self, text: str) -> List[float]:
        """
        获取单个文本的Embedding
        
        Args:
            text: 输入文本
            
        Returns:
            文本的向量表示
        """
        self.initialize()
        
        if self.embeddings:
            try:
                embedding = self.embeddings.embed_query(text)
                return embedding
            except Exception as e:
                print(f"Warning: Failed to get embedding from DashScope: {e}")
                print("Falling back to mock embedding")
        
        # 本地模拟Embedding：使用哈希值生成固定长度的向量
        return self._mock_embedding(text)
    
    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        批量获取文本的Embedding
        
        Args:
            texts: 输入文本列表
            
        Returns:
            文本列表的向量表示
        """
        self.initialize()
        
        if self.embeddings:
            try:
                embeddings = self.embeddings.embed_documents(texts)
                return embeddings
            except Exception as e:
                print(f"Warning: Failed to get embeddings from DashScope: {e}")
                print("Falling back to mock embedding")
        
        # 本地模拟Embedding
        return [self._mock_embedding(text) for text in texts]
    
    def get_vector_size(self) -> int:
        """
        获取向量维度
        
        Returns:
            向量维度大小
        """
        self.initialize()
        return self.vector_size
    
    def _mock_embedding(self, text: str) -> List[float]:
        """
        模拟Embedding生成
        
        Args:
            text: 输入文本
            
        Returns:
            模拟的向量表示
        """
        # 使用MD5哈希生成固定长度的向量
        hash_obj = hashlib.md5(text.encode('utf-8'))
        hash_hex = hash_obj.hexdigest()
        
        # 将哈希值转换为浮点数向量
        vector = []
        for i in range(0, len(hash_hex), 2):
            if len(vector) >= self.vector_size:
                break
            value = int(hash_hex[i:i+2], 16) / 255.0 - 0.5  # 归一化到[-0.5, 0.5]
            vector.append(value)
        
        # 补齐向量长度
        while len(vector) < self.vector_size:
            vector.append(0.0)
        
        return vector


# 创建全局Embedding管理器实例
embedding_manager = EmbeddingManager()
