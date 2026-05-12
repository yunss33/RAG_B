# 服务管理系统 - 产品需求文档

## 1. 产品概述

### 产品名称
ServiceHub - 轻量级服务管理系统

### 核心功能定位
一个基于 TypeScript 的轻量级服务管理系统，提供项目启动、项目管理、Docker 部署等核心功能。系统采用前后端分离架构，后端基于 Fastify 构建 RESTful API，前端使用 React 构建现代化的管理界面。

### 目标用户
- 开发团队
- 运维工程师
- 技术管理人员

---

## 2. 用户需求与核心功能

### 2.1 项目管理

#### 2.1.1 项目列表
- 展示所有已管理的项目
- 显示项目名称、状态、类型、最后更新时间
- 支持搜索和过滤功能
- 支持按名称、状态、创建时间排序

#### 2.1.2 项目详情
- 查看项目的详细信息
- 显示项目配置、环境变量
- 显示项目日志和运行状态

#### 2.1.3 项目创建
- 支持手动添加项目
- 支持配置项目名称、描述、类型
- 支持设置工作目录、启动命令、环境变量
- 支持设置健康检查配置

#### 2.1.4 项目编辑与删除
- 支持编辑项目配置
- 支持删除项目（带确认提示）

### 2.2 服务启动与停止

#### 2.2.1 服务控制
- 启动指定项目
- 停止指定项目
- 重启指定项目
- 查看服务实时日志

#### 2.2.2 批量操作
- 支持批量启动/停止多个项目
- 显示操作进度和结果

### 2.3 Docker 部署

#### 2.3.1 容器管理
- 列出所有 Docker 容器
- 显示容器状态、镜像、端口映射
- 支持启动、停止、重启容器
- 支持查看容器日志

#### 2.3.2 镜像管理
- 列出本地镜像
- 显示镜像信息（名称、标签、大小）
- 支持拉取镜像
- 支持删除镜像

#### 2.3.3 快速部署
- 从模板创建 Docker 容器
- 支持配置端口映射、环境变量
- 支持数据卷挂载
- 支持健康检查配置

#### 2.3.4 Docker Compose 支持
- 支持部署 docker-compose.yml
- 支持启动、停止、查看日志
- 支持查看服务状态

### 2.4 系统概览

#### 2.4.1 仪表盘
- 显示系统状态概览
- 显示运行中的服务数量
- 显示 Docker 容器状态
- 显示系统资源使用情况
- 显示最近操作日志

---

## 3. 功能列表

### 3.1 核心功能
- [ ] 项目 CRUD 操作（创建、读取、更新、删除）
- [ ] 项目服务启动/停止/重启
- [ ] 实时日志查看
- [ ] Docker 容器管理
- [ ] Docker 镜像管理
- [ ] Docker Compose 部署
- [ ] 系统仪表盘
- [ ] 项目搜索和过滤

### 3.2 辅助功能
- [ ] 操作日志记录
- [ ] 健康检查状态显示
- [ ] 环境变量管理
- [ ] 端口占用查看
- [ ] 数据备份配置

---

## 4. 技术架构

### 4.1 前端技术栈
- React 18+ with TypeScript
- Vite 构建工具
- Tailwind CSS
- React Query 数据管理
- React Router 路由

### 4.2 后端技术栈
- Node.js 18+
- Fastify (高性能 Web 框架)
- TypeScript
- Dockerode (Docker API 客户端)
- Nodeactyl (可选，用于 Pterodactyl 面板集成)

### 4.3 数据库
- SQLite (轻量级本地存储)
- 用于存储项目配置和日志

### 4.4 API 设计
- RESTful API
- JSON 格式响应
- JWT 认证（可选）

### 4.5 项目结构

```
service-manager/
├── server/                 # 后端服务
│   ├── src/
│   │   ├── index.ts       # 入口文件
│   │   ├── routes/        # 路由定义
│   │   ├── services/      # 业务逻辑
│   │   ├── models/        # 数据模型
│   │   ├── docker/        # Docker 操作
│   │   └── utils/         # 工具函数
│   └── package.json
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/    # UI 组件
│   │   ├── pages/         # 页面组件
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── api/           # API 调用
│   │   └── types/         # TypeScript 类型
│   └── package.json
└── package.json           # 根目录配置
```

---

## 5. API 接口设计

### 5.1 项目管理
- `GET /api/projects` - 获取所有项目
- `GET /api/projects/:id` - 获取项目详情
- `POST /api/projects` - 创建项目
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 5.2 服务控制
- `POST /api/projects/:id/start` - 启动服务
- `POST /api/projects/:id/stop` - 停止服务
- `POST /api/projects/:id/restart` - 重启服务
- `GET /api/projects/:id/logs` - 获取日志

### 5.3 Docker 管理
- `GET /api/docker/containers` - 获取容器列表
- `POST /api/docker/containers/:id/start` - 启动容器
- `POST /api/docker/containers/:id/stop` - 停止容器
- `POST /api/docker/containers/:id/restart` - 重启容器
- `GET /api/docker/containers/:id/logs` - 获取容器日志
- `GET /api/docker/images` - 获取镜像列表
- `POST /api/docker/images/pull` - 拉取镜像
- `DELETE /api/docker/images/:id` - 删除镜像

### 5.4 Docker Compose
- `GET /api/docker/compose/files` - 获取 compose 文件
- `POST /api/docker/compose/up` - 启动 compose 服务
- `POST /api/docker/compose/down` - 停止 compose 服务
- `GET /api/docker/compose/ps` - 查看服务状态
- `GET /api/docker/compose/logs` - 查看日志

### 5.5 系统信息
- `GET /api/system/stats` - 获取系统统计
- `GET /api/system/info` - 获取系统信息

---

## 6. 验收标准

### 6.1 功能验收
- [ ] 能够添加、编辑、删除项目
- [ ] 能够启动、停止、重启项目服务
- [ ] 能够查看项目日志
- [ ] 能够管理 Docker 容器
- [ ] 能够管理 Docker 镜像
- [ ] 能够部署 Docker Compose 服务
- [ ] 仪表盘正确显示系统状态

### 6.2 性能验收
- [ ] 页面加载时间 < 2秒
- [ ] API 响应时间 < 500ms
- [ ] 日志滚动流畅

### 6.3 可用性验收
- [ ] 界面响应式设计，适配不同屏幕
- [ ] 操作反馈及时，用户体验流畅
- [ ] 错误提示清晰，易于理解

---

## 7. 里程碑计划

### Phase 1: 基础框架搭建
- 项目结构初始化
- 后端 API 框架搭建
- 前端基础界面搭建

### Phase 2: 项目管理功能
- 项目 CRUD
- 服务启停控制
- 日志查看

### Phase 3: Docker 集成
- Docker 容器管理
- Docker 镜像管理
- Docker Compose 支持

### Phase 4: 完善与优化
- 界面优化
- 性能优化
- 错误处理完善
