# CLAUDE.md

This file provides guidance to AI coding agents when working with code in this repository.

## What This Repository Is

This is a **DeepBS 标书多智能体工作台**项目，用于自动化标书写作流程。项目包含：
- 后端 Python 服务（FastAPI）
- 前端 Next.js 应用
- 多智能体协作系统
- 完整的开发和测试流程

## Superpowers Plus 技能配置

**重要：每次编程都必须使用 Superpowers Plus 技能！**

Superpowers Plus 技能已安装在 `.trae/skills/` 目录中。

## 核心工作流

所有开发工作必须遵循以下严格流程：

1. **brainstorming** — 创意设计与需求分析；在设计规范批准前禁止实施
2. **using-git-worktrees** — 在编码前设置隔离的分支/工作树
3. **writing-plans** — 将工作分解为 2-5 分钟的原子任务
4. **executing-plans** — 将任务路由到子智能体（独立任务并行，依赖任务串行）
5. **test-driven-development** — RED → GREEN → REFACTOR 循环；没有先写失败测试前不能写生产代码
6. **verification-before-completion** — 在声称任何事情完成前运行验证
7. **finishing-a-development-branch** — 指导合并/PR/清理决策

## 关键约定

- **铁律 (TDD)：** 如果存在没有失败测试的生产代码，删除它并重新开始。
- **铁律 (调试)：** 没有根因调查就没有修复。在提出任何修复前使用 `systematic-debugging`。
- **自我审查：** 技能使用内联清单（不是子智能体审查循环）— 对于大多数更改更快且足够。
- **提交：** 每个 RED-GREEN-REFACTOR 循环后进行粒度提交。
- **计划：** 存储在 `docs/superpowers/plans/` 中，遵循日期前缀命名约定。

## 文档布局

- `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` — 设计规范
- `docs/superpowers/plans/YYYY-MM-DD-<feature>.md` — 实施计划
- `.trae/documents/` — 临时计划文档
- `SUPERPOWERS_INSTALLATION.md` — Superpowers Plus 安装说明

## 项目架构

- **后端核心**：`src/deepbs_common/` - 包含数据模型、智能体逻辑、存储和仓库
- **编排层**：`src/orchestrator_app/main.py` - 负责流程编排
- **智能体运行时**：`src/agent_runtime_app/` - 智能体执行
- **前端**：`apps/frontend/` - Next.js 应用
- **API 网关**：`src/api_app/main.py` - REST API 接口

## 运行项目

```bash
# 启动所有服务
docker-compose up

# 或使用开发脚本
./scripts/dev-up.ps1
```

## 测试

```bash
# 运行 Python 测试
python -m pytest tests/
```
