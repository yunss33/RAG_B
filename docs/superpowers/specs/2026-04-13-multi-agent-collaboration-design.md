# DeepBS 多智能体协作系统设计文档

**日期**: 2026-04-13
**版本**: 1.0
**状态**: 待审核

## 1. 概述

### 1.1 设计目标

参考 atypica.ai 的设计理念，为 DeepBS 标书多智能体工作台实现：
- 多智能体深度协作系统
- 完整的思考过程可视化
- 智能体工作流程回放功能
- 支持多实例智能体并行工作

### 1.2 参考来源

- 参考网站: https://atypica.ai/
- 参考页面: https://atypica.ai/study/kXnuGGpj4u4r4us2/share?replay=1

---

## 2. 系统架构

### 2.1 整体架构

```
用户界面层
    ↓
编排控制层（Orchestrator）
    ↓
多智能体协作层（5个专门 Agent）
    ↓
数据与存储层
```

### 2.2 智能体角色设计

| 智能体角色 | 图标 | 职责 | 支持多实例 | 典型实例数 |
|------------|------|------|-----------|-----------|
| 招标文件解析专家 | 📋 | 解析招标文件、提取关键需求、识别风险点 | ❌ 单实例 | 1 |
| 章节规划师 | 📐 | 设计标书结构、规划章节内容、定义证据需求 | ✅ 可多实例 | 1-2 |
| 内容撰写专家 | ✍️ | 分章节并行撰写、整合证据材料 | ✅ 多实例 | 章节数 |
| 质量审查员 | 🔍 | 合规性检查、一致性验证、得分点优化 | ✅ 可多实例 | 2-3 |
| 成稿装配师 | 📦 | 内容整合、图片排版、HTML 生成 | ❌ 单实例 | 1 |

### 2.3 多实例协作模式

**内容撰写阶段（并行）:**
```
章节规划师
    ↓
┌─────────────────────────────────────┐
│  Writer-1 (章节1)  Writer-2 (章节2) │  ← 并行执行
│  Writer-3 (章节3)  Writer-4 (章节4) │
└─────────────────────────────────────┘
    ↓
质量审查员 (多视角审查)
```

**方案对比模式（可选）:**
```
招标文件解析专家
    ↓
┌────────────────────┐
│ Planner-1 (方案A)  │
│ Planner-2 (方案B)  │  ← 生成多个大纲方案
└────────────────────┘
    ↓
用户选择 / AI 投票
    ↓
选定方案继续执行
```

---

## 3. 数据模型设计

### 3.1 新增数据模型

在 `src/deepbs_common/schemas.py` 中添加以下模型：

```python
class AgentExecutionLog(BaseModel):
    """智能体执行日志"""
    id: str
    agent_role: str  # "parser" | "planner" | "writer" | "reviewer" | "assembler"
    agent_instance_id: str  # 支持多实例
    task_name: str
    status: str  # "pending" | "running" | "completed" | "failed"
    start_time: str | None
    end_time: str | None
    input_data: dict | None
    thought_chain: list[str]  # 思考过程链
    intermediate_outputs: list[dict]  # 中间结果
    final_output: dict | None
    error_message: str | None


class AgentMessage(BaseModel):
    """智能体间消息"""
    id: str
    from_agent: str
    to_agent: str | None  # None 表示广播
    message_type: str  # "request" | "response" | "notification"
    content: dict
    timestamp: str
```

### 3.2 扩展 RunState 模型

```python
class RunState(BaseModel):
    stage: ProjectStage = ProjectStage.created
    task_tree: list[dict[str, Any]] = Field(default_factory=list)
    retry_count: int = 0
    blocked_reason: str | None = None
    waiting_for_user: bool = False
    # 新增字段
    agent_logs: list[AgentExecutionLog] = Field(default_factory=list)
    agent_messages: list[AgentMessage] = Field(default_factory=list)
    active_agents: dict[str, dict] = Field(default_factory=dict)  # 当前活跃的智能体实例
```

---

## 4. 执行流程设计

### 4.1 完整协作流程

1. **初始化阶段**
   - 创建项目
   - 上传招标文件和知识资料
   - 启动主流程

2. **解析阶段（单智能体）**
   - Parser Agent 启动
   - 解析所有招标文件
   - 提取需求、识别风险
   - 生成结构化需求清单

3. **规划阶段（可选多实例）**
   - 1-2个 Planner Agent 启动
   - 每个生成一个大纲方案
   - （可选）用户选择或 AI 投票
   - 确定最终章节结构

4. **撰写阶段（多实例并行）**
   - 为每个章节启动一个 Writer Agent
   - 所有 Writer 并行工作
   - 每个 Writer：
     - 接收章节目标和证据需求
     - 检索相关证据
     - 生成章节内容
     - 标记证据来源

5. **审查阶段（可选多实例）**
   - 2-3个 Reviewer Agent 启动（不同视角）
   - 合规性审查、一致性检查、得分点优化
   - 合并审查结果

6. **图片建议阶段**
   - Image Suggester 工作
   - 为各章节推荐图片

7. **用户确认阶段**
   - 展示草稿、审查问题、图片建议
   - 用户确认/修改

8. **装配阶段（单智能体）**
   - Assembler Agent 启动
   - 整合所有内容和选中的图片
   - 生成最终 HTML

---

## 5. 界面设计

### 5.1 项目详情页（主控制台）

**顶部状态栏:**
- 项目名称 + 当前阶段
- 全局进度条（0-100%）
- 实时运行时间统计

**智能体活动面板（左侧）:**
- 5个智能体角色卡片
- 每个卡片显示：头像、角色名、状态（空闲/运行中/完成）
- 可点击展开查看该智能体的详细思考过程

**任务时间线（中间主区域）:**
- 垂直时间轴展示
- 每个节点显示：任务名称、执行智能体、时间戳、状态
- 可展开查看每个任务的详细日志和中间结果
- 回放控制条（播放/暂停、速度调节、跳转）

**实时输出面板（右侧）:**
- 当前正在执行的任务输出
- 智能体间的对话消息
- 关键事件通知

### 5.2 智能体卡片设计

每个智能体卡片包含：
- **头像**: 独特的图标 + 配色
- **角色名称**: 如"招标文件解析专家"
- **状态指示器**:
  - 🔵 空闲
  - 🟡 运行中（带脉冲动画）
  - 🟢 已完成
  - 🔴 错误
- **展开按钮**: 点击显示详细思考过程

### 5.3 思考过程展示

点击智能体卡片或时间线节点后，展示：
- **思考链**: 逐步的推理过程
- **输入数据**: 该智能体接收的信息
- **中间结果**: 生成的临时内容
- **最终输出**: 交付给下一个智能体的结果
- **耗时统计**: 执行时间 breakdown

---

## 6. 技术实现计划

### 6.1 实现阶段划分

**阶段一：数据模型扩展（优先级：高）**
- 更新 `src/deepbs_common/schemas.py`，添加新的数据模型
- 更新存储层以支持新的数据结构
- 更新 API 接口

**阶段二：后端逻辑增强（优先级：高）**
- 重构 `src/orchestrator_app/main.py`，支持多智能体实例
- 增强 `src/deepbs_common/agent_logic.py`，生成详细的执行日志
- 添加智能体间消息传递机制
- 支持并行执行多个 Writer Agent

**阶段三：前端界面重构（优先级：高）**
- 重新设计项目详情页面 `apps/frontend/app/projects/[id]/page.tsx`
- 创建智能体活动面板组件
- 创建任务时间线组件
- 创建思考过程展示组件
- 添加回放控制功能

**阶段四：视觉与交互优化（优先级：中）**
- 配色方案与动画效果
- 响应式设计优化
- 加载状态与错误处理
- 用户体验细节打磨

### 6.2 关键文件修改清单

| 文件 | 修改类型 | 说明 |
|------|---------|------|
| `src/deepbs_common/schemas.py` | 扩展 | 添加 AgentExecutionLog, AgentMessage 等模型 |
| `src/orchestrator_app/main.py` | 重构 | 支持多智能体并行、执行日志记录 |
| `src/deepbs_common/agent_logic.py` | 增强 | 生成思考链、中间结果 |
| `apps/frontend/app/projects/[id]/page.tsx` | 重写 | 全新的多智能体协作界面 |
| `apps/frontend/components/` | 新增 | AgentActivityPanel, TaskTimeline, ThoughtProcess 等组件 |
| `apps/frontend/app/globals.css` | 扩展 | 新组件的样式、动画效果 |

---

## 7. 验收标准

- [ ] 5个智能体角色能够正常协作完成标书写作流程
- [ ] 支持多个 Writer Agent 并行撰写不同章节
- [ ] 每个智能体的思考过程完整记录并可查看
- [ ] 任务时间线正确展示，支持回放功能
- [ ] 界面响应式，适配不同屏幕尺寸
- [ ] 所有现有功能保持正常工作
- [ ] 代码通过 lint 和 typecheck 检查

---

## 8. 风险与注意事项

1. **性能风险**: 多智能体并行可能增加服务器负载，需要实现适当的限流
2. **数据存储**: 详细的执行日志会增加存储需求，需要考虑日志归档策略
3. **兼容性**: 确保新的数据结构与现有项目数据兼容
4. **用户体验**: 复杂的界面需要良好的引导和帮助文档
