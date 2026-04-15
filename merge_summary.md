此次合并引入了全面的技能系统、前端功能增强和后端服务优化，包括新增技能模块、前端组件和监控系统，显著提升了系统的功能性和可观测性。
| 文件 | 变更 |
|------|---------|
| apps/frontend/app/globals.css | - 新增多个CSS变量（如accent-hover、shadow-lg、transition等）<br>- 优化字体和布局相关变量<br>- 增强body样式，添加平滑滚动和抗锯齿效果 |
| apps/frontend/app/projects/[id]/page.tsx | - 完全重写项目详情页面，添加多个新组件<br>- 实现客户端状态管理和数据获取逻辑<br>- 新增Agent和Task接口定义 |
| apps/frontend/components/agent-activity-panel.tsx | - 新增Agent活动面板组件，显示Agent状态和活动 |
| apps/frontend/components/message-panel.tsx | - 新增消息面板组件，展示系统消息 |
| apps/frontend/components/skill-dependency.tsx | - 新增技能依赖关系组件，可视化技能间依赖 |
| apps/frontend/components/skill-history.tsx | - 新增技能使用历史组件，记录技能调用历史 |
| apps/frontend/components/skill-recommendation.tsx | - 新增技能推荐组件，基于项目需求推荐技能 |
| apps/frontend/components/skill-stats.tsx | - 新增技能统计组件，展示技能使用统计数据 |
| apps/frontend/components/task-timeline.tsx | - 新增任务时间线组件，可视化任务执行流程 |
| apps/frontend/components/thought-process.tsx | - 新增思考过程组件，展示Agent思考逻辑 |
| src/api_app/main.py | - 添加监控指标（请求计数、延迟、错误率等）<br>- 实现请求限流功能<br>- 配置详细日志记录 |
| src/rag_service_app/main.py | - 添加监控指标和日志配置<br>- 实现文档分块和嵌入功能<br>- 集成Qdrant向量数据库 |
| src/deepbs_common/chunking.py | - 新增文档分块模块，支持文本和PDF分块 |
| src/deepbs_common/embedding.py | - 新增嵌入管理模块，支持文本和多模态嵌入 |
| src/deepbs_common/qdrant.py | - 新增Qdrant向量数据库管理模块 |
| .trae/skills/* | - 新增多个技能模块，包括头脑风暴、系统调试、测试驱动开发等<br>- 每个技能包含完整的实现和文档 |
| .trae/specs/* | - 新增多个规范文档，包括功能测试、前端优化等 |
| docs/* | - 新增API文档、部署文档和使用文档 |
| start-dev.sh | - 新增开发环境启动脚本 |
| tests/* | - 新增API测试、集成测试和仓库测试 |