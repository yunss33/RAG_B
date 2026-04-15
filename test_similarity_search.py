from deepbs_common.embedding import embedding_manager
from deepbs_common.qdrant import qdrant_manager
from deepbs_common.repository import repository
from deepbs_common.schemas import Project, SourceFile, FileType, DocumentChunk, EvidenceItem, RunState, ProjectStage
import uuid

print("Testing similarity search functionality...")

# 测试1: 生成查询语句的Embedding
print("\nTest 1: Generating query embedding...")
try:
    query = "项目技术方案"
    query_vector = embedding_manager.get_embedding(query)
    print(f"Query: {query}")
    print(f"Embedding generated successfully. Vector length: {len(query_vector)}")
    print(f"First 5 values: {query_vector[:5]}")
except Exception as e:
    print(f"Error generating embedding: {e}")

# 测试2: 测试本地相似度计算
print("\nTest 2: Testing local similarity calculation...")
try:
    # 创建测试项目
    project_id = str(uuid.uuid4())
    project = Project(
        id=project_id,
        name="Test Project",
        source_files=[
            SourceFile(
                id=str(uuid.uuid4()),
                file_name="test_document.txt",
                file_type=FileType.other,
                object_key="test/test_document.txt",
                parse_status="indexed"
            )
        ],
        document_chunks=[],
        evidence_items=[],
        run_state=RunState(stage=ProjectStage.created)
    )
    
    # 添加测试文档分块
    test_content = "这是一个关于项目技术方案的文档，包含了详细的技术实现细节和架构设计。"
    chunks_with_positions = [(test_content, 0, len(test_content))]
    chunk_texts = [chunk[0] for chunk in chunks_with_positions]
    vectors = embedding_manager.get_embeddings(chunk_texts)
    
    for i, ((chunk_text, start_pos, end_pos), vector) in enumerate(zip(chunks_with_positions, vectors)):
        chunk = DocumentChunk(
            source_file_id=project.source_files[0].id,
            source_name=project.source_files[0].file_name,
            content=chunk_text,
            start_pos=start_pos,
            end_pos=end_pos,
            vector=vector
        )
        project.document_chunks.append(chunk)
    
    # 保存项目
    repository.save_project(project)
    print(f"Test project created with {len(project.document_chunks)} document chunks")
    
    # 测试搜索
    search_query = "技术方案"
    print(f"Searching for: {search_query}")
    
    # 生成查询向量
    query_vector = embedding_manager.get_embedding(search_query)
    
    # 计算相似度
    def cosine_similarity(v1, v2):
        import math
        dot_product = sum(a * b for a, b in zip(v1, v2))
        magnitude1 = math.sqrt(sum(a * a for a in v1))
        magnitude2 = math.sqrt(sum(a * a for a in v2))
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        return dot_product / (magnitude1 * magnitude2)
    
    # 计算每个分块的相似度
    results = []
    for chunk in project.document_chunks:
        score = cosine_similarity(query_vector, chunk.vector)
        results.append({
            "score": score,
            "content": chunk.content,
            "source_name": chunk.source_name
        })
    
    # 按相似度排序
    results.sort(key=lambda x: x["score"], reverse=True)
    
    print("Search results (sorted by similarity):")
    for i, result in enumerate(results):
        print(f"{i+1}. Score: {result['score']:.4f}, Source: {result['source_name']}")
        print(f"   Content: {result['content'][:100]}...")
        
    print("Local similarity calculation test passed!")
except Exception as e:
    print(f"Error in local similarity test: {e}")

# 测试3: 测试RAG服务的搜索端点
print("\nTest 3: Testing RAG service search endpoint...")
try:
    import requests
    
    # 启动RAG服务
    import subprocess
    import time
    
    # 启动RAG服务
    rag_service = subprocess.Popen(
        ["uv", "run", "uvicorn", "rag_service_app.main:app", "--host", "0.0.0.0", "--port", "8102"],
        cwd="/workspace",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # 等待服务启动
    time.sleep(3)
    
    # 测试健康检查
    health_response = requests.get("http://localhost:8102/healthz")
    print(f"Health check status: {health_response.status_code}")
    
    # 测试搜索
    search_response = requests.post(
        f"http://localhost:8102/internal/projects/{project_id}/search",
        json={"query": "技术方案", "limit": 5}
    )
    
    print(f"Search endpoint status: {search_response.status_code}")
    print(f"Search response: {search_response.json()}")
    
    # 停止RAG服务
    rag_service.terminate()
    rag_service.wait()
    
    print("RAG service search endpoint test completed!")
except Exception as e:
    print(f"Error in RAG service test: {e}")

print("\nSimilarity search functionality test completed!")
