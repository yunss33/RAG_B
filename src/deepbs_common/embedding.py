from __future__ import annotations

from typing import List, Optional
import os
import hashlib

import dashscope


class EmbeddingManager:
    """Embedding模型管理器，使用阿里百炼的multimodal-embedding-v1模型"""
    
    def __init__(self, model_name: str = "multimodal-embedding-v1", api_key: Optional[str] = None):
        """
        初始化Embedding管理器
        
        Args:
            model_name: 使用的模型名称，默认为multimodal-embedding-v1
            api_key: 阿里百炼的API密钥，如果为None则从环境变量DASHSCOPE_API_KEY读取
        """
        self.model_name = model_name
        self.api_key = api_key or os.getenv("DASHSCOPE_API_KEY", "sk-e0a3c05a49d444d79967e67cc5d1a2a9")
        dashscope.api_key = self.api_key
        self.vector_size = 1024  # multimodal-embedding-v1的向量维度
        self._initialized = False
    
    def initialize(self):
        """
        初始化Embedding模型
        """
        if not self._initialized:
            self._initialized = True
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
        
        try:
            resp = dashscope.MultiModalEmbedding.call(
                model=self.model_name,
                input=[
                    {"text": text}
                ]
            )
            if resp.status_code == 200:
                embedding = resp.output['embeddings'][0]['embedding']
                self.vector_size = len(embedding)
                return embedding
            else:
                print(f"Warning: Failed to get embedding from DashScope: {resp}")
                print("Falling back to mock embedding")
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
        
        try:
            inputs = [{"text": text} for text in texts]
            resp = dashscope.MultiModalEmbedding.call(
                model=self.model_name,
                input=inputs
            )
            if resp.status_code == 200:
                embeddings = [item['embedding'] for item in resp.output['embeddings']]
                if embeddings:
                    self.vector_size = len(embeddings[0])
                return embeddings
            else:
                print(f"Warning: Failed to get embeddings from DashScope: {resp}")
                print("Falling back to mock embedding")
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
