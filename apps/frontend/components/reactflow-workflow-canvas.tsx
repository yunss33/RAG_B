'use client';
import { useCallback } from 'react';
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlow = useReactFlow();

  const getAgentTypeColor = (type: string) => {
    const colors = {
      general: '#4CAF50',
      analyzer: '#2196F3',
      planner: '#FF9800',
      writer: '#9C27B0',
      reviewer: '#F44336',
      coordinator: '#607D8B',
    };
    return colors[type as keyof typeof colors] || '#9E9E9E';
  };

  const handleNodeClick = useCallback((event, node) => {
    onNodeSelect({
      id: node.id,
      type: node.data.type,
      position: node.position,
      data: node.data,
    });
  }, [onNodeSelect]);

  const handleNodeDragStop = useCallback((event, node) => {
    onNodeUpdate({
      id: node.id,
      type: node.data.type,
      position: node.position,
      data: node.data,
    });
  }, [onNodeUpdate]);

  const handleConnect = useCallback((params) => {
    const { source, target } = params;
    onEdgeAdd({
      id: `e${source}-${target}`,
      source,
      target,
      label: '连接',
    });
  }, [onEdgeAdd]);

  const handleEdgeDelete = useCallback((edgeId) => {
    onEdgeDelete(edgeId);
  }, [onEdgeDelete]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('text/plain');
    if (!type) return;

    const position = reactFlow.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    onAddNode(type, position);
  }, [reactFlow, onAddNode]);

  // 转换节点格式以适应React Flow
  const reactFlowNodes = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      type: node.type,
    },
    style: {
      borderColor: getAgentTypeColor(node.type),
    },
  }));

  // 转换边格式以适应React Flow
  const reactFlowEdges = edges.map(edge => ({
    ...edge,
    label: edge.label,
  }));

  return (
    <div
      className="workflow-canvas"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDragStop={handleNodeDragStop}
        onConnect={handleConnect}
        onEdgeDelete={handleEdgeDelete}
        defaultViewport={{
          x: pan.x,
          y: pan.y,
          zoom,
        }}
        onViewportChange={({ x, y, zoom }) => {
          onPan({ x, y });
        }}
        panOnScroll={true}
        panOnDrag={true}
        zoomOnDoubleClick={true}
        minZoom={0.5}
        maxZoom={2}
      >
        <Background
          gap={[20, 20]}
          size={1}
          color="#d9c8b0"
        />
      </ReactFlow>
    </div>
  );
}
