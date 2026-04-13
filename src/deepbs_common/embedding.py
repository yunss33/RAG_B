from __future__ import annotations

from typing import List, Optional
import hashlib


class EmbeddingManager:
    """Embedding模型管理器"""
    
    def __init__(self, model_name: str = "paraphrase-multilingual-MiniLM-L12-v2", use_local: bool = True):
        """
        初始化Embedding管理器
        
        Args:
            model_name: 使用的模型名称
            use_local: 是否使用本地模式（用于测试，无需下载模型）
        """
        self.model_name = model_name
        self.use_local = use_local
        self.model = None
        self.vector_size = 768  # MiniLM模型的向量维度
    
    def initialize(self):
        """
        初始化Embedding模型
        """
        if not self.use_local:
            try:
                from sentence_transformers import SentenceTransformer
                if self.model is None:
                    self.model = SentenceTransformer(self.model_name)
                    # 获取实际向量维度
                    test_embedding = self.model.encode("test", convert_to_tensor=False)
                    self.vector_size = len(test_embedding)
            except Exception as e:
                print(f"Warning: Failed to load SentenceTransformer model: {e}")
                print("Using local mock embedding instead")
                self.use_local = True
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
        
        if not self.use_local and self.model:
            embedding = self.model.encode(text, convert_to_tensor=False)
            return embedding.tolist()
        else:
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
        
        if not self.use_local and self.model:
            embeddings = self.model.encode(texts, convert_to_tensor=False)
            return embeddings.tolist()
        else:
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
