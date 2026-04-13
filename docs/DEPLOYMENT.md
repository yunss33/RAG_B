# DeepBS 部署指南

## 概述

本指南详细说明了如何部署和运行 DeepBS 项目，包括环境要求、安装步骤、配置方法和运行命令等。

## 环境要求

### 硬件要求
- CPU: 至少 4 核
- 内存: 至少 8 GB
- 磁盘空间: 至少 50 GB

### 软件要求
- Python 3.10 或更高版本
- Docker 和 Docker Compose (推荐)
- Git

## 部署方式

DeepBS 项目支持两种部署方式：
1. 使用 Docker Compose (推荐)
2. 本地直接运行

### 1. 使用 Docker Compose (推荐)

#### 步骤 1: 克隆项目

```bash
git clone <项目仓库地址>
cd deepbs
```

#### 步骤 2: 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，根据实际情况修改配置
# 主要需要修改的配置项：
# - LLM 相关配置
# - 存储相关配置
# - 服务端口配置
```

#### 步骤 3: 启动服务

```bash
# 构建并启动所有服务
docker compose up --build

# 或者在后台运行
docker compose up --build -d
```

#### 步骤 4: 验证服务

启动后，可以通过以下地址访问服务：
- Frontend: `http://localhost:3000`
- API Gateway: `http://localhost:8100/docs`
- Prometheus Metrics: `http://localhost:8000/metrics`

#### 步骤 5: 停止服务

```bash
# 停止服务
docker compose down

# 停止服务并删除所有数据
docker compose down -v
```

### 2. 本地直接运行

#### 步骤 1: 克隆项目

```bash
git clone <项目仓库地址>
cd deepbs
```

#### 步骤 2: 安装依赖

```bash
# 安装依赖
uv sync --extra dev
```

#### 步骤 3: 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，根据实际情况修改配置
```

#### 步骤 4: 启动服务

可以使用脚本一次性启动所有服务：

```bash
# 启动所有服务
./scripts/dev-up.ps1  # Windows
# 或
bash ./scripts/dev-up.sh  # Linux/Mac
```

也可以分开启动各个服务：

```bash
# 启动后端服务
./scripts/dev-backend.ps1  # Windows
# 或
bash ./scripts/dev-backend.sh  # Linux/Mac

# 启动前端服务
./scripts/dev-frontend.ps1  # Windows
# 或
bash ./scripts/dev-frontend.sh  # Linux/Mac
```

#### 步骤 5: 验证服务

启动后，可以通过以下地址访问服务：
- Frontend: `http://localhost:3000`
- API Gateway: `http://localhost:8100/docs`
- Prometheus Metrics: `http://localhost:8000/metrics`

## 服务配置

### 环境变量配置

主要环境变量配置项：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `DATA_DIR` | 数据存储目录 | `./data` |
| `OBJECT_DIR` | 对象存储目录 | `./data/objects` |
| `API_GATEWAY_PORT` | API 网关端口 | `8100` |
| `ORCHESTRATOR_PORT` | 编排服务端口 | `8101` |
| `RAG_SERVICE_PORT` | RAG 服务端口 | `8102` |
| `AGENT_RUNTIME_PORT` | Agent 运行时端口 | `8103` |
| `FRONTEND_PORT` | 前端端口 | `3000` |
| `PROMETHEUS_PORT` | Prometheus 指标端口 | `8000` |
| `LLM_API_KEY` | LLM API 密钥 | - |
| `LLM_MODEL` | LLM 模型名称 | - |
| `QDRANT_URL` | Qdrant 向量数据库 URL | - |
| `QDRANT_API_KEY` | Qdrant API 密钥 | - |

### 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| Frontend | `3000` | 前端工作台 |
| API Gateway | `8100` | 对外 API 接口 |
| Orchestrator | `8101` | 编排与状态机 |
| RAG Service | `8102` | 入库、切片、检索服务 |
| Agent Runtime | `8103` | Agent 执行服务 |
| Prometheus Metrics | `8000` | 监控指标 |

## 生产环境部署

### 1. 使用 Docker Compose 部署

对于生产环境，建议使用 Docker Compose 部署，并进行以下优化：

1. **修改环境变量**：根据生产环境的实际情况修改 `.env` 文件
2. **使用生产镜像**：构建生产优化的镜像
3. **配置网络**：使用自定义网络，增强安全性
4. **添加持久化存储**：配置数据卷，确保数据持久化
5. **配置日志**：设置适当的日志级别和存储

### 2. 配置 HTTPS

在生产环境中，建议配置 HTTPS 以增强安全性：

1. **获取 SSL 证书**：从证书颁发机构获取 SSL 证书
2. **配置反向代理**：使用 Nginx 或其他反向代理服务器，配置 SSL 证书
3. **更新配置**：修改服务配置，使用 HTTPS

### 3. 监控与告警

生产环境中，建议配置监控与告警：

1. **Prometheus**：使用 Prometheus 收集服务指标
2. **Grafana**：使用 Grafana 可视化监控数据
3. **Alertmanager**：配置告警规则，及时发现和处理问题

## 故障排查

### 常见问题

1. **服务启动失败**
   - 检查端口是否被占用
   - 检查环境变量配置是否正确
   - 检查 Docker 服务是否正常运行

2. **API 接口返回错误**
   - 检查服务日志，查看具体错误信息
   - 检查依赖服务是否正常运行
   - 检查请求参数是否正确

3. **文件上传失败**
   - 检查文件大小是否超过限制
   - 检查存储目录权限是否正确
   - 检查网络连接是否正常

4. **文档处理失败**
   - 检查文件格式是否支持
   - 检查 RAG 服务是否正常运行
   - 检查 LLM 配置是否正确

### 日志查看

```bash
# 查看所有服务日志
docker compose logs

# 查看特定服务日志
docker compose logs api-gateway

# 实时查看日志
docker compose logs -f
```

## 备份与恢复

### 备份

```bash
# 备份数据目录
tar -czf deepbs-backup-$(date +%Y%m%d).tar.gz ./data
```

### 恢复

```bash
# 停止服务
docker compose down

# 恢复数据
rm -rf ./data
tar -xzf deepbs-backup-20240101.tar.gz

# 启动服务
docker compose up --build
```

## 升级

### 步骤 1: 备份数据

```bash
# 备份数据目录
tar -czf deepbs-backup-$(date +%Y%m%d).tar.gz ./data
```

### 步骤 2: 拉取最新代码

```bash
git pull origin main
```

### 步骤 3: 更新依赖

```bash
# 使用 Docker Compose 部署
docker compose build

# 本地运行
uv sync --extra dev
```

### 步骤 4: 启动服务

```bash
# 使用 Docker Compose 部署
docker compose up --build -d

# 本地运行
./scripts/dev-up.ps1  # Windows
# 或
bash ./scripts/dev-up.sh  # Linux/Mac
```

## 安全建议

1. **环境变量安全**：不要在 `.env` 文件中存储敏感信息，如 API 密钥
2. **网络安全**：配置适当的网络隔离，限制外部访问
3. **权限控制**：设置适当的文件和目录权限
4. **定期更新**：定期更新依赖和组件，修复安全漏洞
5. **监控**：配置监控和告警，及时发现安全问题

## 总结

本指南提供了 DeepBS 项目的部署和运行方法，包括使用 Docker Compose 和本地直接运行两种方式。在部署过程中，应根据实际情况进行适当的配置和优化，确保服务的稳定性和安全性。
