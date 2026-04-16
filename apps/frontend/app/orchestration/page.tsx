'use client';
import { useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import ReactFlowWorkflowCanvas from '@/components/reactflow-workflow-canvas';
import NodeLibrary from '@/components/node-library';
import NodeInspector from '@/components/node-inspector';
import Toolbar from '@/components/workflow-toolbar';
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
    setPan 
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
        />
        <div className="right-panel">
          <NodeInspector
            node={state.selectedNode}
            onUpdate={updateNode}
            onDelete={deleteNode}
          />
        </div>
      </div>
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
