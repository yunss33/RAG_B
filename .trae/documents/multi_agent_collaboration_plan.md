# 多智能体协作系统实施计划

## 1. 仓库研究结论

通过对代码库的分析，项目结构如下：
- **后端核心**：`src/deepbs_common/` - 包含数据模型、智能体逻辑、存储和仓库
- **编排层**：`src/orchestrator_app/main.py` - 负责流程编排
- **智能体运行时**：`src/agent_runtime_app/` - 智能体执行
- **前端**：`apps/frontend/` - Next.js 应用
- **现有数据模型**：在 [schemas.py](file:///workspace/src/deepbs_common/schemas.py) 中定义了完整的项目数据结构
- **现有流程**：在 [orchestrator_app/main.py](file:///workspace/src/orchestrator_app/main.py) 中实现了线性的智能体调用流程

## 2. 要编辑的文件和模块

### 阶段一：数据模型扩展
- [src/deepbs_common/schemas.py](file:///workspace/src/deepbs_common/schemas.py) - 添加 AgentExecutionLog 和 AgentMessage 模型，扩展 RunState 模型

### 阶段二：后端逻辑增强
- [src/orchestrator_app/main.py](file:///workspace/src/orchestrator_app/main.py) - 重构编排逻辑，支持多实例并行、执行日志记录
- [src/deepbs_common/agent_logic.py](file:///workspace/src/deepbs_common/agent_logic.py) - 增强以生成思考链和中间结果

### 阶段三：前端界面重构
- [apps/frontend/app/projects/[id]/page.tsx](file:///workspace/apps/frontend/app/projects/[id]/page.tsx) - 重写项目详情页面
- [apps/frontend/components/](file:///workspace/apps/frontend/components/) - 新增多个组件
- [apps/frontend/app/globals.css](file:///workspace/apps/frontend/app/globals.css) - 扩展样式

## 3. 修改或新增功能的步骤

### 阶段一：数据模型扩展（优先级：高）

1. 在 [schemas.py](file:///workspace/src/deepbs_common/schemas.py) 中添加 AgentExecutionLog 模型，记录智能体执行的完整生命周期
2. 添加 AgentMessage 模型，支持智能体间消息传递
3. 扩展 RunState 模型，添加 agent_logs、agent_messages 和 active_agents 字段
4. 更新相关的响应模型以包含新数据

### 阶段二：后端逻辑增强（优先级：高）

1. 重构 [orchestrator_app/main.py](file:///workspace/src/orchestrator_app/main.py)：
   - 创建智能体实例管理器
   - 实现并行执行多个 Writer Agent 的逻辑
   - 添加完整的执行日志记录
   - 实现智能体间消息传递机制
2. 增强 [agent_logic.py](file:///workspace/src/deepbs_common/agent_logic.py)：
   - 为每个智能体函数添加思考链生成
   - 记录中间结果
   - 支持多实例标识

### 阶段三：前端界面重构（优先级：高）

1. 创建智能体活动面板组件（AgentActivityPanel）
2. 创建任务时间线组件（TaskTimeline）
3. 创建思考过程展示组件（ThoughtProcess）
4. 重写 [项目详情页面](file:///workspace/apps/frontend/app/projects/[id]/page.tsx)，集成新组件
5. 添加回放控制功能

### 阶段四：视觉与交互优化（优先级：中）

1. 在 [globals.css](file:///workspace/apps/frontend/app/globals.css) 中添加新组件的样式和动画
2. 优化响应式设计
3. 完善加载状态和错误处理
4. 打磨用户体验细节

## 4. 潜在依赖或考虑事项

1. **并发控制**：多智能体并行需要考虑服务器负载，需要实现适当的限流机制
2. **数据一致性**：确保多个智能体同时更新项目状态时的数据一致性
3. **兼容性**：新的数据结构需要与现有项目数据保持向后兼容
4. **API 扩展**：可能需要新增或修改 API 端点以支持新功能
5. **前端状态管理**：考虑是否需要引入状态管理库（如 Zustand 或 Redux）

## 5. 风险处理

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 多智能体并行导致服务器过载 | 高 | 实现智能体实例池和队列机制，限制最大并发数 |
| 执行日志数据量过大 | 中 | 实现日志压缩和归档策略，设置保留期限 |
| 前端重构导致功能退化 | 高 | 保留现有页面作为回退选项，逐步迁移功能 |
| 数据模型变更导致现有项目损坏 | 高 | 实现数据迁移脚本，在变更前备份数据 |
| 开发周期超出预期 | 中 | 按阶段交付，每个阶段完成后进行测试和验证 |

## 6. 验收标准

- [ ] 5个智能体角色能够正常协作完成标书写作流程
- [ ] 支持多个 Writer Agent 并行撰写不同章节
- [ ] 每个智能体的思考过程完整记录并可查看
- [ ] 任务时间线正确展示，支持回放功能
- [ ] 界面响应式，适配不同屏幕尺寸
- [ ] 所有现有功能保持正常工作
- [ ] 代码通过 lint 和 typecheck 检查
