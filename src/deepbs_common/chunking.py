from __future__ import annotations

from typing import List, Tuple


class DocumentChunker:
    """文档分块器"""
    
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        """
        初始化文档分块器
        
        Args:
            chunk_size: 每个块的最大长度
            chunk_overlap: 块之间的重叠长度
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def chunk_by_paragraphs(self, text: str) -> List[str]:
        """
        按段落分块
        
        Args:
            text: 输入文本
            
        Returns:
            分块后的文本列表
        """
        # 按段落分割
        paragraphs = text.split('\n\n')
        chunks = []
        current_chunk = []
        current_length = 0
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            para_length = len(para)
            
            if current_length + para_length <= self.chunk_size:
                current_chunk.append(para)
                current_length += para_length + 2  # 加两个换行符
            else:
                if current_chunk:
                    chunks.append('\n\n'.join(current_chunk))
                
                # 检查单个段落是否超过chunk_size
                if para_length > self.chunk_size:
                    # 按句子进一步分割
                    sentence_chunks = self._split_long_text(para)
                    chunks.extend(sentence_chunks)
                else:
                    current_chunk = [para]
                    current_length = para_length + 2
        
        if current_chunk:
            chunks.append('\n\n'.join(current_chunk))
        
        return chunks
    
    def _split_long_text(self, text: str) -> List[str]:
        """
        分割长文本
        
        Args:
            text: 长文本
            
        Returns:
            分割后的文本列表
        """
        # 按句子分割
        sentences = []
        current_sentence = []
        
        for char in text:
            current_sentence.append(char)
            if char in ['.', '!', '?', '。', '！', '？']:
                sentences.append(''.join(current_sentence))
                current_sentence = []
        
        if current_sentence:
            sentences.append(''.join(current_sentence))
        
        # 重新组合句子
        chunks = []
        current_chunk = []
        current_length = 0
        
        for sentence in sentences:
            sentence_length = len(sentence)
            
            if current_length + sentence_length <= self.chunk_size:
                current_chunk.append(sentence)
                current_length += sentence_length
            else:
                if current_chunk:
                    chunks.append(''.join(current_chunk))
                
                # 处理单个句子过长的情况
                if sentence_length > self.chunk_size:
                    # 按固定长度分割
                    for i in range(0, sentence_length, self.chunk_size - self.chunk_overlap):
                        end = min(i + self.chunk_size, sentence_length)
                        chunks.append(sentence[i:end])
                else:
                    current_chunk = [sentence]
                    current_length = sentence_length
        
        if current_chunk:
            chunks.append(''.join(current_chunk))
        
        return chunks
    
    def chunk_with_overlap(self, text: str) -> List[Tuple[str, int, int]]:
        """
        带重叠的分块
        
        Args:
            text: 输入文本
            
        Returns:
            分块后的文本列表，包含(文本, 起始位置, 结束位置)
        """
        paragraphs = text.split('\n\n')
        chunks = []
        current_position = 0
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                current_position += 2  # 两个换行符
                continue
            
            para_start = current_position
            para_end = current_position + len(para)
            
            if len(para) <= self.chunk_size:
                chunks.append((para, para_start, para_end))
            else:
                # 按句子分割
                sentences = self._split_into_sentences(para)
                current_chunk = []
                current_chunk_start = para_start
                current_chunk_length = 0
                
                for sentence in sentences:
                    sentence_length = len(sentence)
                    
                    if current_chunk_length + sentence_length <= self.chunk_size:
                        current_chunk.append(sentence)
                        current_chunk_length += sentence_length
                    else:
                        if current_chunk:
                            chunk_text = ''.join(current_chunk)
                            chunk_end = current_chunk_start + len(chunk_text)
                            chunks.append((chunk_text, current_chunk_start, chunk_end))
                        
                        # 开始新块，添加重叠
                        if self.chunk_overlap > 0 and current_chunk:
                            overlap_text = ''.join(current_chunk[-self.chunk_overlap:])
                            current_chunk = [overlap_text, sentence]
                            current_chunk_start = current_chunk_start + len(''.join(current_chunk[:-1]))
                            current_chunk_length = len(overlap_text) + sentence_length
                        else:
                            current_chunk = [sentence]
                            current_chunk_start = current_position + text[current_position:].find(sentence)
                            current_chunk_length = sentence_length
                
                if current_chunk:
                    chunk_text = ''.join(current_chunk)
                    chunk_end = current_chunk_start + len(chunk_text)
                    chunks.append((chunk_text, current_chunk_start, chunk_end))
            
            current_position = para_end + 2  # 两个换行符
        
        return chunks
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """
        将文本分割为句子
        
        Args:
            text: 输入文本
            
        Returns:
            句子列表
        """
        sentences = []
        current_sentence = []
        punctuation = ['.', '!', '?', '。', '！', '？']
        
        for char in text:
            current_sentence.append(char)
            if char in punctuation:
                sentences.append(''.join(current_sentence))
                current_sentence = []
        
        if current_sentence:
            sentences.append(''.join(current_sentence))
        
        return sentences


# 创建全局分块器实例
document_chunker = DocumentChunker()
