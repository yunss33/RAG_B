'use client';
import { useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import ReactFlowWorkflowCanvas from '@/components/reactflow-workflow-canvas';
import NodeLibrary from '@/components/node-library';
import NodeInspector from '@/components/node-inspector';
import Toolbar from '@/components/workflow-toolbar';
import ExecutionHistory from '@/components/execution-history';
import ModeSwitcher from '@/components/mode-switcher';
import MultiAgentView from '@/components/multi-agent-view';
import { WorkflowProvider, useWorkflow } from '@/lib/store/workflow-store';

// 主页面组件
function OrchestrationContent() {
  const { 
    state, 
    loadWorkflows, 
    saveWorkflow, 
    runWorkflow, 
    addNode, 
    updateNode, 
    deleteNode, 
    addEdge, 
    deleteEdge, 
    selectNode, 
    setZoom, 
    setPan,
    setMode,
    selectAgent
  } = useWorkflow();

  // 加载工作流数据
  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  // 保存工作流到后端
  useEffect(() => {
    if (!state.workflowId || state.isLoading) return;

    // 防抖保存
    const timer = setTimeout(saveWorkflow, 1000);
    return () => clearTimeout(timer);
  }, [state.nodes, state.edges, state.workflowId, state.isLoading, saveWorkflow]);

  return (
    <div className="orchestration-workspace">
      <Toolbar 
        zoom={state.zoom} 
        onZoom={setZoom} 
        onRunWorkflow={runWorkflow} 
      />
      <ModeSwitcher 
        currentMode={state.mode} 
        onModeChange={setMode} 
      />
      
      {state.mode === 'workflow' && (
        <div className="workflow-container">
          <NodeLibrary onAddNode={addNode} />
          <ReactFlowWorkflowCanvas
            nodes={state.nodes}
            edges={state.edges}
            selectedNode={state.selectedNode}
            onNodeSelect={selectNode}
            onNodeUpdate={updateNode}
            onNodeDelete={deleteNode}
            onEdgeAdd={addEdge}
            onEdgeDelete={deleteEdge}
            onAddNode={addNode}
            zoom={state.zoom}
            pan={state.pan}
            onPan={setPan}
            nodeStatuses={state.nodeStatuses}
          />
          <div className="right-panel">
            <NodeInspector
              node={state.selectedNode}
              onUpdate={updateNode}
              onDelete={deleteNode}
            />
            <ExecutionHistory history={state.executionHistory} />
          </div>
        </div>
      )}
      
      {state.mode === 'orchestration' && (
        <div className="workflow-container">
          <NodeLibrary onAddNode={addNode} />
          <ReactFlowWorkflowCanvas
            nodes={state.nodes}
            edges={state.edges}
            selectedNode={state.selectedNode}
            onNodeSelect={selectNode}
            onNodeUpdate={updateNode}
            onNodeDelete={deleteNode}
            onEdgeAdd={addEdge}
            onEdgeDelete={deleteEdge}
            onAddNode={addNode}
            zoom={state.zoom}
            pan={state.pan}
            onPan={setPan}
            nodeStatuses={state.nodeStatuses}
          />
          <div className="right-panel">
            <NodeInspector
              node={state.selectedNode}
              onUpdate={updateNode}
              onDelete={deleteNode}
            />
            <ExecutionHistory history={state.executionHistory} />
          </div>
        </div>
      )}
      
      {state.mode === 'multi-agent' && (
        <div className="workflow-container">
          <div className="multi-agent-main">
            <MultiAgentView
              agents={state.agents}
              onAgentSelect={selectAgent}
              selectedAgent={state.selectedAgent}
            />
          </div>
          <div className="right-panel">
            {state.selectedAgent && (
              <div className="agent-details">
                <h3>智能体详情</h3>
                <div className="agent-detail-card">
                  <h4>{state.selectedAgent.name}</h4>
                  <p className="agent-type">{state.selectedAgent.type}</p>
                  <p className="agent-description">{state.selectedAgent.description}</p>
                  {state.selectedAgent.capabilities && state.selectedAgent.capabilities.length > 0 && (
                    <div className="agent-capabilities">
                      <h5>能力</h5>
                      <div className="capabilities-list">
                        {state.selectedAgent.capabilities.map((capability, index) => (
                          <span key={index} className="capability-tag">
                            {capability}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="agent-role">
                    <span className={`role-badge ${state.selectedAgent.isMain ? 'main' : ''}`}>
                      {state.selectedAgent.isMain ? '总智能体' : '团队成员'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 根组件
export default function OrchestrationPage() {
  return (
    <ReactFlowProvider>
      <WorkflowProvider>
        <OrchestrationContent />
      </WorkflowProvider>
    </ReactFlowProvider>
  );
}
