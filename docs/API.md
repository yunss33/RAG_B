# DeepBS API 文档

## 概述

DeepBS API 提供了项目管理和文档处理的功能，包括项目创建、文件上传、文档处理、状态查询等操作。

## 基础信息

- **API 基础URL**: `http://localhost:8100`
- **API 文档地址**: `http://localhost:8100/docs`
- **认证**: 目前不需要认证

## API 接口

### 1. 健康检查

**路径**: `/healthz`
**方法**: `GET`
**描述**: 检查服务健康状态，包括依赖服务的状态

**返回值**:
```json
{
  "status": "ok",
  "dependencies": {
    "storage": "ok",
    "rag_service": "ok",
    "orchestrator": "ok"
  }
}
```

### 2. 项目管理

#### 2.1 获取项目列表

**路径**: `/projects`
**方法**: `GET`
**描述**: 获取所有项目的列表

**返回值**:
```json
[
  {
    "id": "project-id",
    "name": "Project Name",
    "description": "Project Description",
    "target_language": "zh-CN",
    "created_by": "admin",
    "created_at": "2024-01-01T00:00:00Z",
    "run_state": {
      "stage": "created",
      "waiting_for_user": false,
      "blocked_reason": null
    },
    "source_files": [],
    "requirements": [],
    "outline": [],
    "drafts": [],
    "review_issues": [],
    "image_suggestions": [],
    "final_html_object_key": null
  }
]
```

#### 2.2 创建项目

**路径**: `/projects`
**方法**: `POST`
**描述**: 创建新项目

**请求体**:
```json
{
  "name": "Project Name",
  "description": "Project Description",
  "target_language": "zh-CN"
}
```

**返回值**:
```json
{
  "project_id": "project-id"
}
```

#### 2.3 获取项目详情

**路径**: `/projects/{project_id}`
**方法**: `GET`
**描述**: 获取指定项目的详细信息

**参数**:
- `project_id`: 项目ID

**返回值**:
```json
{
  "id": "project-id",
  "name": "Project Name",
  "description": "Project Description",
  "target_language": "zh-CN",
  "created_by": "admin",
  "created_at": "2024-01-01T00:00:00Z",
  "run_state": {
    "stage": "created",
    "waiting_for_user": false,
    "blocked_reason": null
  },
  "source_files": [],
  "requirements": [],
  "outline": [],
  "drafts": [],
  "review_issues": [],
  "image_suggestions": [],
  "final_html_object_key": null
}
```

#### 2.4 上传文件

**路径**: `/projects/{project_id}/files`
**方法**: `POST`
**描述**: 上传文件到项目

**参数**:
- `project_id`: 项目ID
- `file`: 要上传的文件
- `file_type`: 文件类型 (tender, knowledge, case, image, other)

**返回值**:
```json
{
  "id": "file-id",
  "file_name": "file.txt",
  "file_type": "tender",
  "object_key": "objects/file.txt",
  "mime_type": "text/plain",
  "parse_status": "uploaded",
  "version": 1,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 2.5 处理项目文件

**路径**: `/projects/{project_id}/ingest`
**方法**: `POST`
**描述**: 处理项目文件，进行文档分块和向量生成

**参数**:
- `project_id`: 项目ID

**返回值**:
```json
{
  "project_id": "project-id",
  "stage": "ingesting",
  "ingested_files": 1,
  "evidence_items": 5,
  "image_candidates": 2
}
```

#### 2.6 运行项目

**路径**: `/projects/{project_id}/run`
**方法**: `POST`
**描述**: 运行项目流程

**参数**:
- `project_id`: 项目ID

**返回值**:
```json
{
  "project_id": "project-id",
  "stage": "planning",
  "waiting_for_user": false
}
```

#### 2.7 获取项目状态

**路径**: `/projects/{project_id}/status`
**方法**: `GET`
**描述**: 获取项目的当前状态

**参数**:
- `project_id`: 项目ID

**返回值**:
```json
{
  "project_id": "project-id",
  "stage": "created",
  "waiting_for_user": false,
  "blocked_reason": null,
  "source_file_count": 1,
  "requirement_count": 0,
  "draft_count": 0,
  "review_issue_count": 0,
  "image_suggestion_count": 0,
  "final_html_ready": false
}
```

#### 2.8 获取项目需求

**路径**: `/projects/{project_id}/requirements`
**方法**: `GET`
**描述**: 获取项目的需求列表

**参数**:
- `project_id`: 项目ID

**返回值**:
```json
[
  {
    "id": "requirement-id",
    "category": "qualification",
    "source_text": "Requirement text",
    "normalized_text": "Normalized requirement text",
    "mandatory": true,
    "risk_level": "high"
  }
]
```

#### 2.9 获取项目大纲

**路径**: `/projects/{project_id}/outline`
**方法**: `GET`
**描述**: 获取项目的大纲

**参数**:
- `project_id`: 项目ID

**返回值**:
```json
[
  {
    "id": "section-id",
    "code": "1.1",
    "title": "Section Title",
    "goal": "Section goal",
    "evidence_requirements": ["Evidence 1", "Evidence 2"],
    "status": "planned"
  }
]
```

#### 2.10 获取项目草稿

**路径**: `/projects/{project_id}/drafts`
**方法**: `GET`
**描述**: 获取项目的草稿和评审问题

**参数**:
- `project_id`: 项目ID

**返回值**:
```json
{
  "drafts": [
    {
      "id": "draft-id",
      "outline_section_id": "section-id",
      "title": "Draft Title",
      "content": "Draft content",
      "evidence_bindings": [],
      "evidence_ids": [],
      "missing_inputs": []
    }
  ],
  "review_issues": [
    {
      "id": "issue-id",
      "issue_type": "compliance",
      "severity": "high",
      "section_title": "Section Title",
      "message": "Issue message",
      "suggested_action": "Suggested action"
    }
  ]
}
```

#### 2.11 获取图片建议

**路径**: `/projects/{project_id}/image-suggestions`
**方法**: `GET`
**描述**: 获取项目的图片建议

**参数**:
- `project_id`: 项目ID

**返回值**:
```json
[
  {
    "id": "suggestion-id",
    "source_file_id": "file-id",
    "source_name": "file.jpg",
    "suggested_section_title": "Section Title",
    "usage_label": "illustration",
    "placement": "top",
    "caption": "Image caption",
    "preview_url": "http://localhost:8100/objects/file.jpg",
    "selected": false
  }
]
```

#### 2.12 设置图片选择

**路径**: `/projects/{project_id}/image-selections`
**方法**: `POST`
**描述**: 设置项目的图片选择

**参数**:
- `project_id`: 项目ID

**请求体**:
```json
[
  {
    "suggestion_id": "suggestion-id",
    "accepted": true,
    "placement": "top",
    "layout": "full"
  }
]
```

**返回值**:
```json
{
  "project_id": "project-id",
  "stage": "assembling",
  "waiting_for_user": false
}
```

#### 2.13 获取最终HTML

**路径**: `/projects/{project_id}/final-html`
**方法**: `GET`
**描述**: 获取项目的最终HTML

**参数**:
- `project_id`: 项目ID

**返回值**:
```json
{
  "project_id": "project-id",
  "html": "<html>...</html>",
  "url": "http://localhost:8100/objects/final.html"
}
```

#### 2.14 搜索项目文档向量

**路径**: `/projects/{project_id}/search`
**方法**: `POST`
**描述**: 搜索项目的文档向量

**参数**:
- `project_id`: 项目ID
- `query`: 搜索查询文本
- `limit`: 返回结果数量限制，默认5
- `type`: 搜索类型 (all, document_chunk, evidence_item)，默认all
- `threshold`: 相似度阈值，默认0.0
- `file_type`: 按文件类型过滤，可选

**返回值**:
```json
{
  "results": [
    {
      "id": "result-id",
      "type": "document_chunk",
      "content": "Content",
      "source_name": "file.txt",
      "similarity": 0.9
    }
  ]
}
```

### 3. 对象服务

#### 3.1 提供对象

**路径**: `/objects/{object_key}`
**方法**: `GET`
**描述**: 提供存储的对象（文件）

**参数**:
- `object_key`: 对象键

**返回值**: 文件内容

## 错误处理

API 使用标准 HTTP 状态码来表示错误：

- `404 Not Found`: 资源不存在
- `400 Bad Request`: 请求参数错误
- `500 Internal Server Error`: 服务器内部错误
- `429 Too Many Requests`: 请求过于频繁，超过限流阈值

错误响应格式：

```json
{
  "detail": "Error message"
}
```

## 限流

API 实现了基于IP的限流，每个IP在60秒内最多可以发送100个请求。超过限制的请求会返回429状态码。

## 监控

API 提供了 Prometheus 监控指标，可通过 `http://localhost:8000/metrics` 访问。

## 示例请求

### 创建项目

```bash
curl -X POST http://localhost:8100/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "description": "Test Description"}'
```

### 上传文件

```bash
curl -X POST http://localhost:8100/projects/{project_id}/files \
  -F "file=@test.txt" \
  -F "file_type=tender"
```

### 处理项目文件

```bash
curl -X POST http://localhost:8100/projects/{project_id}/ingest
```

### 运行项目

```bash
curl -X POST http://localhost:8100/projects/{project_id}/run
```
