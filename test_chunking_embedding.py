#!/usr/bin/env python3
"""
测试文档分块和Embedding功能
"""

from deepbs_common.chunking import document_chunker
from deepbs_common.embedding import embedding_manager

# 测试文本
test_text = """这是一个测试文档，用于验证文档分块和Embedding功能。

文档分块是RAG系统中的重要组成部分，它将长文本分割成小块，以便于处理和检索。

Embedding模型将文本转换为向量表示，使得计算机能够理解文本的语义。

本测试将验证：
1. 文档分块功能是否正常
2. Embedding模型是否能够生成有效的向量
3. 分块后的文本是否能够正确生成向量
"""

print("=== 测试文档分块功能 ===")
print("原始文本:")
print(test_text)
print("\n" + "="*50 + "\n")

# 测试按段落分块
print("按段落分块:")
paragraph_chunks = document_chunker.chunk_by_paragraphs(test_text)
for i, chunk in enumerate(paragraph_chunks):
    print(f"块 {i+1}:\n{chunk}\n")

print("="*50 + "\n")

# 测试带重叠的分块
print("带重叠的分块:")
overlap_chunks = document_chunker.chunk_with_overlap(test_text)
for i, (chunk, start, end) in enumerate(overlap_chunks):
    print(f"块 {i+1} (位置: {start}-{end}):\n{chunk}\n")

print("=== 测试Embedding功能 ===")
print("\n" + "="*50 + "\n")

# 测试单个文本的Embedding
print("测试单个文本的Embedding:")
test_sentence = "这是一个测试句子"
embedding = embedding_manager.get_embedding(test_sentence)
print(f"句子: {test_sentence}")
print(f"向量长度: {len(embedding)}")
print(f"向量前10个值: {embedding[:10]}")

print("\n" + "="*50 + "\n")

# 测试批量文本的Embedding
print("测试批量文本的Embedding:")
test_sentences = ["第一个测试句子", "第二个测试句子", "第三个测试句子"]
embeddings = embedding_manager.get_embeddings(test_sentences)
for i, (sentence, emb) in enumerate(zip(test_sentences, embeddings)):
    print(f"句子 {i+1}: {sentence}")
    print(f"向量长度: {len(emb)}")
    print(f"向量前5个值: {emb[:5]}")
    print()

print("\n" + "="*50 + "\n")

# 测试分块后的文本Embedding
print("测试分块后的文本Embedding:")
if paragraph_chunks:
    chunk_embeddings = embedding_manager.get_embeddings(paragraph_chunks)
    for i, (chunk, emb) in enumerate(zip(paragraph_chunks, chunk_embeddings)):
        print(f"块 {i+1} 向量长度: {len(emb)}")
        print(f"块 {i+1} 内容预览: {chunk[:50]}...")
        print()

print("\n=== 测试完成 ===")
print("所有功能测试成功！")
