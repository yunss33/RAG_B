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
  const [nodes, setNodes, onNodesChange] = useNodesState<ReactFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ReactFlowEdge>([]);
  const reactFlow = useReactFlow();

  useEffect(() => {
    const reactFlowNodes = initialNodes.map(node => ({
      id: node.id,
      type: 'custom',
      position: node.position,
      data: {
        ...node.data,
        type: node.type,
      },
      selected: selectedNode?.id === node.id,
    }));
    setNodes(reactFlowNodes);
  }, [initialNodes, selectedNode, setNodes]);

  useEffect(() => {
    const reactFlowEdges = initialEdges.map(edge => ({
      ...edge,
      animated: true,
    }));
    setEdges(reactFlowEdges);
  }, [initialEdges, setEdges]);

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

  const handleEdgeDelete = useCallback((edgeId: string) => {
    onEdgeDelete(edgeId);
  }, [onEdgeDelete]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('text/plain');
    if (!type) return;

    const position = reactFlow.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    onAddNode(type, position);
  }, [reactFlow, onAddNode]);

  return (
    <div
      className="workflow-canvas"
      style={{ height: '100%', width: '100%' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDragStop={handleNodeDragStop}
        onConnect={handleConnect}
        onEdgeDelete={handleEdgeDelete}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        defaultViewport={{
          x: pan.x,
          y: pan.y,
          zoom,
        }}
        onViewportChange={({ x, y, zoom: newZoom }) => {
          onPan({ x, y });
        }}
        panOnScroll={true}
        panOnDrag={true}
        zoomOnDoubleClick={true}
        minZoom={0.2}
        maxZoom={4}
        nodesDraggable={true}
        nodesConnectable={true}
        fitView
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
