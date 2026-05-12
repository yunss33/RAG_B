# ServiceHub - 轻量级服务管理系统

一个基于 TypeScript 的轻量级服务管理系统，提供项目启动、项目管理、Docker 部署等核心功能。

## 功能特性

- 📊 **仪表盘** - 实时监控系统状态和资源使用
- 🚀 **项目管理** - 创建、启动、停止、重启项目服务
- 🐳 **Docker 管理** - 管理容器、镜像和 Docker Compose 服务
- 📝 **操作日志** - 记录所有系统操作
- ⚙️ **系统设置** - 自定义系统配置

## 技术栈

### 后端
- Node.js 18+
- Fastify - 高性能 Web 框架
- SQLite - 轻量级数据库
- Dockerode - Docker API 客户端

### 前端
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- TanStack Query
- Lucide Icons

## 快速开始

### 前置要求

- Node.js 18+
- Docker (可选，用于 Docker 管理功能)
- npm 或 yarn

### 安装

1. 安装前端依赖

```bash
cd apps/frontend
npm install
```

2. 安装后端依赖

```bash
cd apps/frontend/server
npm install
```

### 开发模式

1. 启动后端服务

```bash
cd apps/frontend/server
npm run dev
```

后端服务将在 http://localhost:3001 运行

2. 启动前端开发服务器

```bash
cd apps/frontend
npm run dev
```

前端应用将在 http://localhost:3000 运行

### Docker 部署

使用 Docker Compose 一键部署：

```bash
docker-compose up -d
```

## 项目结构

```
apps/frontend/
├── server/              # 后端服务
│   ├── src/
│   │   ├── index.ts     # 入口文件
│   │   ├── routes/      # API 路由
│   │   └── services/    # 业务逻辑
│   └── package.json
├── app/                 # Next.js 前端
│   ├── app/            # 页面组件
│   ├── components/     # UI 组件
│   └── lib/            # 工具函数
├── components/         # 共享组件
└── docker-compose.yml  # 部署配置
```

## API 接口

### 项目管理
- `GET /api/projects` - 获取所有项目
- `POST /api/projects` - 创建项目
- `POST /api/projects/:id/start` - 启动项目
- `POST /api/projects/:id/stop` - 停止项目
- `POST /api/projects/:id/restart` - 重启项目

### Docker 管理
- `GET /api/docker/containers` - 获取容器列表
- `GET /api/docker/images` - 获取镜像列表
- `POST /api/docker/images/pull` - 拉取镜像
- `GET /api/docker/compose/ps` - 查看 Compose 服务状态

### 系统
- `GET /api/system/stats` - 获取系统统计
- `GET /api/system/health` - 健康检查

## 配置

后端配置文件: `server/.env`

```env
PORT=3001
NODE_ENV=development
DB_PATH=./data/service-manager.db
DOCKER_SOCKET=/var/run/docker.sock
```

前端环境变量: `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 使用说明

### 创建项目

1. 点击「新建项目」按钮
2. 填写项目名称、类型和工作目录
3. 设置启动命令或入口文件
4. 点击「创建项目」

### 管理项目

- **启动**: 点击项目卡片上的播放按钮
- **停止**: 点击项目卡片上的停止按钮
- **重启**: 点击项目卡片上的重启按钮
- **查看日志**: 点击项目卡片上的眼睛图标
- **删除**: 点击项目卡片上的删除按钮

### Docker 管理

- **容器**: 查看和管理所有 Docker 容器
- **镜像**: 拉取和删除 Docker 镜像
- **Compose**: 管理 Docker Compose 服务（在 compose 目录放置配置文件）

## 开发

### 构建生产版本

```bash
# 前端
npm run build

# 后端
cd server && npm run build
```

### 代码规范

项目使用 ESLint 和 TypeScript 进行代码检查。

## License

MIT
