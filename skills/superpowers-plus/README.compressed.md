# Superpowers Plus

Superpowers Plus 是基于上游 `superpowers` 演进出来的强化版工作流技能集，面向 Claude Code、Codex、OpenCode、Gemini CLI 等编码代理环境。

## 工作原理

1. 启动编码代理时自动工作
2. 先询问用户真正需求，提炼规格说明
3. 制定详细实施计划，强调红-绿 TDD、YAGNI 和 DRY 原则
4. 启动 `executing-plans` 进程，自动选择并行或串行子代理路由

## 基本工作流

1. **brainstorming** - 细化想法，探索替代方案，保存设计文档
2. **using-git-worktrees** - 创建隔离工作空间，验证测试基线
3. **writing-plans** - 分解为小任务，每个任务有确切文件路径和验证步骤
4. **executing-plans** - 自动分派子代理，保持审查检查点
5. **test-driven-development** - 强制执行 RED-GREEN-REFACTOR 循环
6. **requesting-code-review** - 根据计划审查，报告问题
7. **finishing-a-development-branch** - 验证测试，提供合并选项

## 技能库

**测试**
- test-driven-development - RED-GREEN-REFACTOR 循环

**调试**
- systematic-debugging - 4 阶段根本原因流程
- verification-before-completion - 确保实际修复

**协作**
- brainstorming - 苏格拉底式设计细化
- writing-plans - 详细实施计划
- executing-plans - 自动并行/串行子代理路由
- dispatching-parallel-agents - 并发子代理工作流
- requesting-code-review - 审查前检查清单
- receiving-code-review - 响应反馈
- using-git-worktrees - 并行开发分支
- finishing-a-development-branch - 合并/PR 决策工作流

**元技能**
- writing-skills - 按照最佳实践创建新技能
- using-superpowers - 技能系统介绍

## 理念

- **测试驱动开发** - 始终先编写测试
- **系统化优于临时性** - 流程优于猜测
- **降低复杂性** - 简单性作为首要目标
- **证据优于声明** - 在宣布成功之前先验证

## 安装

- GitHub: `https://github.com/xhyqaq/superpowers-plus`
- Codex 安装脚本: `https://raw.githubusercontent.com/xhyqaq/superpowers-plus/refs/heads/main/.codex/INSTALL.md`
- OpenCode 安装脚本: `https://raw.githubusercontent.com/xhyqaq/superpowers-plus/refs/heads/main/.opencode/INSTALL.md`

### Claude Code

**快速安装（推荐）：**
```
git clone https://github.com/xhyqaq/superpowers-plus.git ~/.claude/superpowers-plus
bash ~/.claude/superpowers-plus/.claude-plugin/install.sh
```

**手动安装：**
```
git clone https://github.com/xhyqaq/superpowers-plus.git ~/.claude/superpowers-plus
mkdir -p ~/.claude/skills
cd ~/.claude/superpowers-plus/skills
for skill in */; do
 skill_name="${skill%/}"
 ln -sf "$HOME/.claude/superpowers-plus/skills/$skill_name" "$HOME/.claude/skills/superpowers:$skill_name" done
```

**验证安装：**
```
ls ~/.claude/skills/ | grep superpowers:
```

## 验证安装

在你选择的平台上启动一个新会话，并请求一些应该触发技能的内容（例如，"帮我规划这个功能"或"让我们调试这个问题"）。代理应该会自动调用相关的 Superpowers Plus 技能。