# DeepBS MVP

招标标书多智能体 MVP 骨架，包含：

- `frontend`: Next.js 工作台
- `api-gateway`: FastAPI 对外接口
- `orchestrator`: 编排与状态机
- `agent-runtime`: 统一 Agent 执行服务
- `rag-service`: 入库、切片、检索与图片资产元数据服务

## Quick Start

1. 复制环境变量：

```powershell
Copy-Item .env.example .env
```

2. 启动基础设施和服务：

```powershell
docker compose up --build
```

3. 访问：

- Frontend: `http://localhost:3000`
- API Gateway: `http://localhost:8100/docs`

## No Docker Fallback

如果当前机器没有安装 Docker 或 Docker Desktop 无法启动，可直接本地运行：

```powershell
uv sync --extra dev
.\scripts\dev-up.ps1
```

也可以分开启动：

```powershell
.\scripts\dev-backend.ps1
.\scripts\dev-frontend.ps1
```

默认本地端口：

- API Gateway: `8100`
- Orchestrator: `8101`
- RAG Service: `8102`
- Agent Runtime: `8103`
- Frontend: `3000`

## Notes

- 当前实现以本地 JSON 存储和磁盘对象存储打通 MVP 流程。
- 已保留 `ObjectStorage`、`LLMProvider`、RAG 和 Agent 的替换接口。
- 文档解析与模型生成目前是可运行的占位实现，后续可替换为真实 Provider。
