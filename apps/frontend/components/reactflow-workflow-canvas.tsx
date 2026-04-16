'use client';
import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './custom-node';

// 将 nodeTypes 移到组件外部以避免 React Flow 警告
const nodeTypes = {
  custom: CustomNode,
};

const nodeClassName = (node: ReactFlowNode) => {
  return node.data.type;
};

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    name: string;
    description: string;
    capabilities: string[];
  };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
}

interface ReactFlowWorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  onNodeSelect: (node: Node) => void;
  onNodeUpdate: (node: Node) => void;
  onNodeDelete: (nodeId: string) => void;
  onEdgeAdd: (edge: Edge) => void;
  onEdgeDelete: (edgeId: string) => void;
  onAddNode: (type: string, position: { x: number; y: number }) => void;
  zoom: number;
  pan: { x: number; y: number };
  onPan: (pan: { x: number; y: number }) => void;
}

export default function ReactFlowWorkflowCanvas({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode,
  onNodeSelect,
  onNodeUpdate,
  onNodeDelete,
  onEdgeAdd,
  onEdgeDelete,
  onAddNode,
  zoom,
  pan,
  onPan,
}: ReactFlowWorkflowCanvasProps) {
  const reactFlow = useReactFlow();

  // 转换节点数据为React Flow格式
  const nodes = initialNodes.map(node => ({
    id: node.id,
    type: 'custom',
    position: node.position,
    data: {
      ...node.data,
      type: node.type,
    },
    selected: selectedNode?.id === node.id,
  }));

  // 转换边数据为React Flow格式
  const edges = initialEdges.map(edge => ({
    ...edge,
    animated: true,
  }));

  // 空的onNodesChange和onEdgesChange函数
  const onNodesChange = () => {};
  const onEdgesChange = () => {};

  const handleNodeClick = useCallback((event: React.MouseEvent, node: ReactFlowNode) => {
    const originalNode = initialNodes.find(n => n.id === node.id);
    if (originalNode) {
      onNodeSelect(originalNode);
    }
  }, [initialNodes, onNodeSelect]);

  const handleNodeDragStop = useCallback((event: React.MouseEvent, node: ReactFlowNode) => {
    const originalNode = initialNodes.find(n => n.id === node.id);
    if (originalNode) {
      onNodeUpdate({
        ...originalNode,
        position: node.position,
      });
    }
  }, [initialNodes, onNodeUpdate]);

  const handleConnect = useCallback((params: any) => {
    const { source, target } = params;
    onEdgeAdd({
      id: `e${source}-${target}`,
      source,
      target,
      label: '连接',
    });
  }, [onEdgeAdd]);

  const handleEdgesChange = useCallback((changes: any) => {
    // 处理边的删除事件
    changes.forEach((change: any) => {
      if (change.type === 'remove' && change.itemType === 'edge') {
        onEdgeDelete(change.id);
      }
    });
  }, [onEdgeDelete]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('text/plain');
    if (!type) return;

    // 计算画布位置
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 确保位置是正数
    const normalizedX = Math.max(0, x);
    const normalizedY = Math.max(0, y);

    console.log('Dropped node type:', type, 'at position:', { x: normalizedX, y: normalizedY });
    onAddNode(type, { x: normalizedX, y: normalizedY });
  }, [onAddNode]);

  return (
    <div
      className="workflow-canvas"
      style={{ height: '100%', width: '100%' }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={handleEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDragStop={handleNodeDragStop}
        onConnect={handleConnect}
        defaultViewport={{
          x: pan.x,
          y: pan.y,
          zoom,
        }}
        onViewportChange={(viewport) => {
          if (viewport) {
            onPan({ x: viewport.x, y: viewport.y });
          }
        }}
        panOnScroll={true}
        panOnDrag={true}
        zoomOnDoubleClick={true}
        minZoom={0.2}
        maxZoom={4}
        nodesDraggable={true}
        nodesConnectable={true}
        attributionPosition="top-right"
      >
        <Background
          gap={[16, 16]}
          size={1}
          color="#e2e8f0"
        />
        <MiniMap 
          nodeClassName={nodeClassName} 
          zoomable 
          pannable 
        />
        <Controls />
      </ReactFlow>
    </div>
  );
}
