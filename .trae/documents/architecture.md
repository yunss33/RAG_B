# 服务管理系统 - 技术架构文档

## 一、系统概述

### 1.1 架构设计理念

本系统采用现代化的前后端分离架构设计，旨在构建一个高效、易用、可扩展的轻量级服务管理平台。系统以 TypeScript 为核心开发语言，确保全栈类型安全，减少运行时错误，提升开发效率和代码质量。整体设计遵循以下核心原则：模块化设计使各功能组件低耦合、高内聚，便于维护和扩展；RESTful API 规范确保前后端通信标准化；响应式设计保证多终端适配能力；实时状态更新提供流畅的用户体验。

### 1.2 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      客户端层 (Client)                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                 React 18 + TypeScript                     ││
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐   ││
│  │  │ Dashboard │  │ Projects  │  │ Docker Manager    │   ││
│  │  └───────────┘  └───────────┘  └───────────────────┘   ││
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐   ││
│  │  │ Services  │  │  Logs     │  │ Settings          │   ││
│  │  └───────────┘  └───────────┘  └───────────────────┘   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API 网关层 (API Gateway)                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Fastify Server (Node.js 18+)               ││
│  │  ┌─────────────────────────────────────────────────┐    ││
│  │  │ CORS │ Rate Limit │ Auth │ Logging │ Validation │    ││
│  │  └─────────────────────────────────────────────────┘    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   项目服务层     │ │   Docker服务层   │ │   系统服务层     │
│ (Project API)  │ │ (Docker API)    │ │ (System API)    │
│                 │ │                 │ │                 │
│ · CRUD操作     │ │ · 容器管理      │ │ · 系统统计      │
│ · 启停控制     │ │ · 镜像管理      │ │ · 健康检查      │
│ · 日志获取     │ │ · Compose管理   │ │ · 配置管理      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层 (Data Layer)                   │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │    SQLite 数据库      │  │      Docker Engine           │ │
│  │                       │  │                              │ │
│  │ · 项目配置            │  │ · Container Runtime          │ │
│  │ · 操作日志            │  │ · Image Storage              │ │
│  │ · 用户设置            │  │ · Volume Management          │ │
│  └──────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、技术栈详解

### 2.1 后端技术栈

#### 2.1.1 运行时环境

Node.js 18 LTS 版本作为运行时环境，提供稳定的异步 I/O 能力和现代化的 JavaScript 特性支持。该版本长期维护，性能优异，且对 TypeScript 有着良好的原生支持，能够显著提升开发体验和运行效率。选用 LTS 版本确保生产环境的稳定性和安全性，避免因版本迭代带来的兼容性风险。

#### 2.1.2 Web 框架

Fastify 作为后端 Web 框架，相比 Express 有着更出色的性能表现。Fastify 基于 Schema 的数据验证机制能够自动生成 API 文档，降低开发维护成本；插件化架构使功能扩展变得简单灵活；内置日志系统采用 Pino，性能卓越且格式友好。实际测试中，Fastify 的吞吐量可达 Express 的两倍以上，这对于需要处理大量并发请求的服务管理系统尤为重要。

#### 2.1.3 Docker 集成

Dockerode 是 Node.js 环境下最成熟的 Docker API 客户端库。它提供了完整的 Docker Engine API 封装，支持容器、镜像、网络、数据卷等所有核心资源的管理操作。Dockerode 基于 Promise 的异步 API 设计，与 Fastify 的异步处理模型完美契合。此外，系统还支持通过 child_process 模块直接执行 docker 和 docker-compose 命令，以应对某些复杂场景。

#### 2.1.4 数据库选型

SQLite 作为轻量级嵌入式数据库，非常适合服务管理系统这种单机部署场景。SQLite 无需独立进程，数据以单一文件形式存储，部署运维极其简单；文件级锁机制在低并发场景下性能优异；完整的 ACID 事务支持确保数据一致性。配合 better-sqlite3 或 sql.js 库，可以在 Node.js 环境中高效访问 SQLite 数据库。

### 2.2 前端技术栈

#### 2.2.1 框架选择

React 18 引入的并发渲染特性为构建高性能管理界面提供了坚实基础。配合 TypeScript 的静态类型检查，前端代码质量得到充分保障。React 18 的自动批处理机制优化了状态更新性能；Suspense 和 Concurrent Features 使异步数据加载更加流畅。函数式组件和 Hooks 模式使组件逻辑更加清晰，复用性更强。

#### 2.2.2 构建工具

Vite 作为新一代前端构建工具，利用浏览器原生 ES 模块实现极速开发体验。开发环境下无需打包即可运行，热更新几乎是即时的；生产环境采用 Rollup 进行高效打包，输出文件体积小、加载快。相比 Webpack，Vite 的配置更加简洁直观，开发效率显著提升。

#### 2.2.3 样式方案

Tailwind CSS 是一款实用优先的原子化 CSS 框架。通过组合预设的工具类，可以快速构建响应式界面，且无需编写大量自定义 CSS。Tailwind 的按需生成机制确保最终打包体积最小化。配合 @tailwindcss/typography 等插件，可以快速实现专业的界面效果。对于复杂的动态样式需求，可结合 CSS-in-JS 方案处理。

#### 2.2.4 状态管理与数据获取

TanStack Query（原 React Query）是处理服务端状态的最佳选择。它自动管理缓存、后台更新、乐观更新等复杂逻辑，大大简化了数据获取代码；内置的重试机制和错误处理使 API 调用更加健壮。对于全局 UI 状态，可使用 Zustand 或 Context API 管理，Zustand 相比 Redux 更加轻量，API 设计简洁现代。

#### 2.2.5 路由管理

React Router v6 是 React 生态中最成熟的路由解决方案。声明式路由配置与组件结构自然对应，嵌套路由使布局代码更加清晰；编程式导航和路由参数解析功能完善；自动滚动管理和 URL 状态同步等细节处理优秀。

---

## 三、数据模型设计

### 3.1 项目实体

项目（Project）是系统的核心实体，代表一个可管理的服务单元。每个项目包含唯一标识符、基本信息、运行配置和元数据四类字段。

```typescript
interface Project {
  id: string;                          // UUID 唯一标识
  name: string;                         // 项目名称
  description?: string;                 // 项目描述
  type: 'node' | 'python' | 'docker' | 'custom';  // 项目类型
  status: 'stopped' | 'running' | 'error' | 'starting';  // 运行状态
  
  // 路径配置
  workingDirectory: string;             // 工作目录
  entryPoint?: string;                   // 入口文件
  
  // 启动配置
  command?: string;                      // 启动命令
  arguments?: string[];                  // 启动参数
  environment: Record<string, string>;  // 环境变量
  
  // 健康检查
  healthCheck?: {
    enabled: boolean;
    endpoint?: string;
    interval: number;                     // 检查间隔（秒）
    timeout: number;                      // 超时时间（秒）
  };
  
  // 元数据
  createdAt: Date;
  updatedAt: Date;
  lastStartedAt?: Date;
  pid?: number;                          // 进程 ID
}
```

### 3.2 Docker 实体

容器和镜像是 Docker 管理的核心资源。系统通过标准化接口封装 Docker 资源，确保管理操作的统一性。

```typescript
interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'exited' | 'paused' | 'created';
  state: string;
  ports: PortMapping[];
  created: Date;
  labels: Record<string, string>;
}

interface PortMapping {
  privatePort: number;
  publicPort?: number;
  type: 'tcp' | 'udp';
}

interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: number;
  created: Date;
}

interface DockerComposeService {
  name: string;
  project: string;
  status: 'running' | 'stopped';
  replicas: number;
  ports: PortMapping[];
}
```

### 3.3 操作日志实体

所有关键操作都需要记录日志，便于审计和问题排查。

```typescript
interface OperationLog {
  id: string;
  timestamp: Date;
  type: 'project' | 'docker' | 'system';
  action: 'create' | 'update' | 'delete' | 'start' | 'stop' | 'restart';
  target: string;                        // 目标资源 ID 或名称
  targetType: string;                    // 目标类型
  status: 'success' | 'failed';
  message?: string;                      // 详细信息或错误消息
  metadata?: Record<string, any>;        // 附加信息
}
```

---

## 四、API 接口设计

### 4.1 RESTful 规范遵循

所有 API 接口遵循 RESTful 设计规范，使用标准的 HTTP 方法表达操作语义。GET 用于查询，POST 用于创建和执行动作，PUT 用于完整更新，PATCH 用于部分更新，DELETE 用于删除资源。响应状态码遵循 HTTP 标准：200 表示成功，201 表示资源创建成功，400 表示请求参数错误，404 表示资源不存在，500 表示服务器内部错误。

### 4.2 项目管理接口

| 方法 | 路径 | 描述 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | /api/projects | 获取项目列表 | - | Project[] |
| GET | /api/projects/:id | 获取项目详情 | - | Project |
| POST | /api/projects | 创建项目 | ProjectCreate | Project |
| PUT | /api/projects/:id | 更新项目 | ProjectUpdate | Project |
| DELETE | /api/projects/:id | 删除项目 | - | void |
| POST | /api/projects/:id/start | 启动项目 | - | { success, pid } |
| POST | /api/projects/:id/stop | 停止项目 | - | { success } |
| POST | /api/projects/:id/restart | 重启项目 | - | { success, pid } |
| GET | /api/projects/:id/logs | 获取日志 | ?tail=100 | string |
| GET | /api/projects/:id/metrics | 获取监控数据 | - | Metrics |

### 4.3 Docker 管理接口

| 方法 | 路径 | 描述 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | /api/docker/containers | 获取容器列表 | - | Container[] |
| GET | /api/docker/containers/:id | 获取容器详情 | - | Container |
| POST | /api/docker/containers/:id/start | 启动容器 | - | { success } |
| POST | /api/docker/containers/:id/stop | 停止容器 | - | { success } |
| POST | /api/docker/containers/:id/restart | 重启容器 | - | { success } |
| DELETE | /api/docker/containers/:id | 删除容器 | - | { success } |
| GET | /api/docker/containers/:id/logs | 获取容器日志 | ?tail=100 | string |
| GET | /api/docker/images | 获取镜像列表 | - | Image[] |
| POST | /api/docker/images/pull | 拉取镜像 | { repo, tag } | { success } |
| DELETE | /api/docker/images/:id | 删除镜像 | - | { success } |

### 4.4 Docker Compose 接口

| 方法 | 路径 | 描述 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | /api/docker/compose/files | 获取文件列表 | - | string[] |
| POST | /api/docker/compose/up | 启动服务 | { file, detached } | { success } |
| POST | /api/docker/compose/down | 停止服务 | { file } | { success } |
| POST | /api/docker/compose/restart | 重启服务 | { file, service } | { success } |
| GET | /api/docker/compose/ps | 查看服务状态 | ?file | Service[] |
| GET | /api/docker/compose/logs | 查看日志 | ?file&service | string |

### 4.5 系统接口

| 方法 | 路径 | 描述 | 响应 |
|------|------|------|------|
| GET | /api/system/stats | 系统统计 | SystemStats |
| GET | /api/system/info | 系统信息 | SystemInfo |
| GET | /api/system/health | 健康检查 | { status } |
| GET | /api/logs | 操作日志 | Log[] |

---

## 五、安全设计

### 5.1 输入验证

所有 API 输入必须经过严格验证。使用 Fastify 内置的 JSON Schema 验证机制，定义每个端点的请求参数格式和类型。数值参数设置合理范围，字符串参数限制长度和格式。对于 SQL 查询，使用参数化查询防止注入攻击。对于文件路径操作，进行路径遍历检查，防止目录穿越漏洞。

### 5.2 权限控制

系统采用基于角色的访问控制模型。默认情况下，本地部署的系统采用单用户模式，所有操作均需授权。生产环境建议配合反向代理实现认证机制。敏感操作如删除资源、停止服务等，需要二次确认，防止误操作。

### 5.3 进程隔离

项目服务以独立子进程运行，通过 IPC 机制与主进程通信。主进程负责监控子进程状态，异常退出时自动重启或报警。进程标准输出和错误输出实时捕获，避免日志丢失。

### 5.4 Docker 安全

Docker 操作遵循最小权限原则，仅请求必要的 API 权限。容器以非 root 用户运行，避免特权容器。敏感配置如环境变量中的密钥，使用 Docker Secrets 管理。网络隔离确保容器间通信可控。

---

## 六、性能优化策略

### 6.1 后端性能

Fastify 采用惰性加载路由，服务器启动快速且内存占用低。数据库查询使用连接池复用连接，减少连接开销。日志系统采用异步写入，避免 I/O 阻塞操作。对于耗时操作如镜像拉取、容器构建，使用流式响应及时返回进度。

### 6.2 前端性能

组件采用懒加载模式，按需加载减少首屏时间。API 响应数据缓存至本地，避免重复请求。列表渲染使用虚拟滚动技术，即使面对大量数据也能保持流畅。图片资源使用 WebP 格式和懒加载，优化加载速度。

### 6.3 实时更新

服务状态和日志采用 Server-Sent Events（SSE）实现实时推送，相比轮询更加高效且服务器负载更低。前端 WebSocket 维护心跳机制，连接中断自动重连。状态更新采用乐观更新策略，用户操作立即反馈，后台异步同步。

---

## 七、部署架构

### 7.1 开发环境

开发环境采用全量热重载模式，前端 Vite Dev Server 与后端服务并行运行。CORS 配置允许前端开发服务器跨域访问后端 API。Docker 服务连接宿主机 Docker Engine，开发调试更加便捷。环境变量通过 .env 文件管理，开发配置与生产配置分离。

### 7.2 生产环境

生产环境建议使用 PM2 或 Docker 部署后端服务，确保进程管理和自动重启能力。反向代理 Nginx 处理静态文件服务和负载均衡。HTTPS 配置通过 Let's Encrypt 自动证书，保障通信安全。日志输出至文件或日志收集系统，便于排查问题。

### 7.3 Docker Compose 部署

系统自身支持 Docker Compose 一键部署。配置文件中定义前端、后端服务以及必要的环境变量。数据目录挂载宿主机路径，实现数据持久化。健康检查配置确保服务自动恢复能力。

---

## 八、目录结构

```
service-manager/
├── server/                              # 后端服务目录
│   ├── src/
│   │   ├── index.ts                    # 应用入口
│   │   ├── app.ts                      # Fastify 实例配置
│   │   ├── config/
│   │   │   └── index.ts                # 配置加载
│   │   ├── routes/
│   │   │   ├── projects.ts             # 项目路由
│   │   │   ├── docker.ts              # Docker 路由
│   │   │   ├── compose.ts             # Compose 路由
│   │   │   ├── system.ts              # 系统路由
│   │   │   └── logs.ts                # 日志路由
│   │   ├── services/
│   │   │   ├── project.service.ts     # 项目业务逻辑
│   │   │   ├── docker.service.ts       # Docker 操作
│   │   │   └── log.service.ts         # 日志服务
│   │   ├── models/
│   │   │   ├── database.ts            # 数据库连接
│   │   │   └── schema.ts              # 表结构定义
│   │   ├── utils/
│   │   │   ├── process.ts             # 进程管理工具
│   │   │   ├── logger.ts              # 日志工具
│   │   │   └── validation.ts          # 验证工具
│   │   └── types/
│   │       └── index.ts               # 类型定义
│   ├── package.json
│   └── tsconfig.json
├── client/                              # 前端应用目录
│   ├── src/
│   │   ├── main.tsx                   # 应用入口
│   │   ├── App.tsx                    # 根组件
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx        # 侧边栏
│   │   │   │   ├── Header.tsx         # 头部
│   │   │   │   └── Layout.tsx         # 布局组件
│   │   │   ├── projects/
│   │   │   │   ├── ProjectList.tsx    # 项目列表
│   │   │   │   ├── ProjectCard.tsx    # 项目卡片
│   │   │   │   └── ProjectForm.tsx    # 项目表单
│   │   │   ├── docker/
│   │   │   │   ├── ContainerList.tsx  # 容器列表
│   │   │   │   ├── ImageList.tsx      # 镜像列表
│   │   │   │   └── ComposePanel.tsx   # Compose 面板
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCard.tsx      # 统计卡片
│   │   │   │   └── ActivityLog.tsx    # 活动日志
│   │   │   └── common/
│   │   │       ├── Button.tsx         # 按钮组件
│   │   │       ├── Modal.tsx          # 弹窗组件
│   │   │       ├── Table.tsx          # 表格组件
│   │   │       └── Terminal.tsx       # 终端组件
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx          # 仪表盘
│   │   │   ├── Projects.tsx           # 项目管理
│   │   │   ├── ProjectDetail.tsx      # 项目详情
│   │   │   ├── Docker.tsx             # Docker 管理
│   │   │   └── Logs.tsx               # 日志查看
│   │   ├── hooks/
│   │   │   ├── useProjects.ts         # 项目 Hook
│   │   │   ├── useDocker.ts           # Docker Hook
│   │   │   └── useWebSocket.ts        # WebSocket Hook
│   │   ├── api/
│   │   │   ├── client.ts              # API 客户端
│   │   │   ├── projects.ts            # 项目 API
│   │   │   ├── docker.ts              # Docker API
│   │   │   └── system.ts              # 系统 API
│   │   ├── stores/
│   │   │   └── app.store.ts           # 全局状态
│   │   ├── types/
│   │   │   └── index.ts               # 类型定义
│   │   └── styles/
│   │       └── globals.css            # 全局样式
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docker/
│   └── docker-compose.yml             # 部署配置
├── package.json                        # 工作区配置
└── tsconfig.json                       # 根类型配置
```

---

## 九、技术选型总结

本系统选用 TypeScript 作为统一开发语言，实现前后端类型安全。Fastify 后端框架提供高性能 API 服务，SQLite 数据库满足轻量级存储需求，Dockerode 实现 Docker 集成。React 18 配合 Vite 构建流畅的管理界面，Tailwind CSS 提供高效的样式开发体验。整体技术栈成熟稳定，社区资源丰富，便于后续维护和扩展。
