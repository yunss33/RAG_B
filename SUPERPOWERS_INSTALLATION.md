# Superpowers Plus 技能安装说明

## 安装状态

✅ **Superpowers Plus 技能已成功安装！**

## 已安装的技能

Superpowers Plus 包含以下 23 个技能：

### 核心工作流技能
- **brainstorming** - 创意设计与需求分析
- **writing-plans** - 详细实施计划编写
- **executing-plans** - 计划执行与子智能体调度
- **using-git-worktrees** - Git 工作树管理
- **finishing-a-development-branch** - 开发分支完成

### 测试技能
- **test-driven-development** - 测试驱动开发 (TDD)
- **acceptance-testing** - 验收测试
- **verification-before-completion** - 完成前验证

### 调试技能
- **systematic-debugging** - 系统化调试
- **root-cause-tracing** - 根因追踪
- **condition-based-waiting** - 条件等待

### 协作技能
- **requesting-code-review** - 请求代码审查
- **receiving-code-review** - 接收代码审查反馈
- **dispatching-parallel-agents** - 并行智能体调度
- **writing-acceptance-criteria** - 编写验收标准

### 仓库管理技能
- **bootstrapping-repository-memory** - 初始化仓库记忆
- **curating-repository-memory** - 管理仓库记忆
- **distilling-lessons** - 提炼经验教训

### 元技能
- **writing-skills** - 创建新技能
- **using-superpowers** - Superpowers 入门指南

## 技能位置

所有技能已安装在：
```
/workspace/.trae/skills/
```

## 使用方法

### 触发技能

技能会根据上下文自动触发，你也可以通过以下方式明确调用：

```
使用 brainstorming 技能来设计这个功能
使用 writing-plans 技能来编写实施计划
使用 executing-plans 技能来执行计划
使用 test-driven-development 技能来实现这个功能
使用 systematic-debugging 技能来调试这个问题
```

### 核心工作流

Superpowers Plus 的标准工作流程是：

1. **brainstorming** - 从创意到设计规范
2. **writing-acceptance-criteria** - 编写验收标准
3. **writing-plans** - 编写详细实施计划
4. **executing-plans** - 执行计划（使用子智能体）
5. **acceptance-testing** - 验收测试
6. **finishing-a-development-branch** - 完成分支

## 关键特性

### 🎯 设计优先
- 所有功能都需要先经过设计阶段
- 强调 YAGNI（You Aren't Gonna Need It）原则
- 支持自主模式，减少审批环节

### 🧪 测试驱动
- 严格遵循 RED-GREEN-REFACTOR 循环
- 先写测试，再写代码
- 包含测试反模式参考

### 🤖 子智能体调度
- 自动判断任务是否适合并行执行
- 子智能体使用更低成本的模型
- 最小化上下文传递

### 📝 完整文档
- 所有设计都保存到 `docs/superpowers/specs/`
- 所有计划都保存到 `docs/superpowers/plans/`
- 验收标准保存到 `docs/superpowers/acceptance/`

## 下一步

现在你可以：
1. 开始一个新项目，使用 `brainstorming` 技能
2. 对现有功能，使用 `writing-plans` 技能
3. 遇到问题，使用 `systematic-debugging` 技能
4. 想要测试，使用 `test-driven-development` 技能

享受你的 Superpowers！🚀
