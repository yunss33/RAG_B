此次合并主要增强了代理执行的日志记录和监控功能，同时新增了开发环境启动脚本和测试文件。变更包括为各个代理函数添加详细的执行日志，以及在数据模型中添加代理执行相关的字段。
| 文件 | 变更 |
|------|---------|
| src/agent_runtime_app/main.py | - 为review_project、suggest_images、assemble_html函数添加@record_agent_execution装饰器，实现执行日志记录<br>- 在各函数中添加详细的思考链和中间输出日志<br>- 为函数添加log参数，用于传递日志对象 |
| src/deepbs_common/schemas.py | - 新增AgentExecutionLog模型，用于记录代理执行的详细信息<br>- 新增AgentMessage模型，用于记录代理间的消息<br>- 在RunState模型中添加agent_logs、agent_messages、active_agents字段 |
| src/orchestrator_app/main.py | - 新增_create_agent_log和_update_agent_log_status函数，用于管理代理日志<br>- 新增_add_agent_message函数，用于管理代理间消息<br>- 为每个代理任务添加详细的日志记录和状态更新<br>- 改进项目状态管理，记录活跃代理信息 |
| start-dev.sh | - 新增开发环境启动脚本，用于启动所有服务组件<br>- 配置环境变量，设置各服务的基础URL<br>- 按顺序启动agent-runtime、rag-service、orchestrator、api-gateway和前端服务 |
| test-file.txt | - 新增测试文件，用于功能测试 |
| test-tender.txt | - 新增测试招标文件内容文件 |
| test-tender-full.txt | - 新增完整功能测试招标文件内容文件 |
| superpowers-plus | - 新增子项目，可能提供额外功能支持 |