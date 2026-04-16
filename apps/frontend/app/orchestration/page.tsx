'use client';
import { useState, useRef, useCallback } from 'react';
import WorkflowCanvas from '@/components/workflow-canvas';
import NodeLibrary from '@/components/node-library';
import NodeInspector from '@/components/node-inspector';
import Toolbar from '@/components/workflow-toolbar';

export default function OrchestrationPage() {
  const [nodes, setNodes] = useState<any[]>([
    {
      id: '1',
      type: 'analyzer',
      position: { x: 100, y: 100 },
      data: {
        name: '招标解析智能体',
        description: '分析招标文件，提取关键要求',
        capabilities: ['文档解析', '要求提取', '关键词识别'],
      },
    },
    {
      id: '2',
      type: 'planner',
      position: { x: 300, y: 100 },
      data: {
        name: '章节规划智能体',
        description: '根据招标要求生成标书章节结构',
        capabilities: ['结构设计', '内容规划', '逻辑梳理'],
      },
    },
    {
      id: '3',
      type: 'writer',
      position: { x: 500, y: 100 },
      data: {
        name: '章节写作智能体',
        description: '自动生成各章节内容',
        capabilities: ['内容生成', '格式规范', '专业术语'],
      },
    },
  ]);

  const [edges, setEdges] = useState<any[]>([
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      label: '传递解析结果',
    },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
      label: '传递章节规划',
    },
  ]);

  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleNodeSelect = useCallback((node: any) => {
    setSelectedNode(node);
  }, []);

  const handleNodeAdd = useCallback((type: string, position: { x: number; y: number }) => {
    const newNode = {
      id: (nodes.length + 1).toString(),
      type,
      position,
      data: {
        name: `${type}智能体`,
        description: '',
        capabilities: [],
      },
    };
    setNodes([...nodes, newNode]);
  }, [nodes]);

  const handleNodeUpdate = useCallback((updatedNode: any) => {
    setNodes(nodes.map(node => node.id === updatedNode.id ? updatedNode : node));
  }, [nodes]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    setEdges(edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(null);
    }
  }, [nodes, edges, selectedNode]);

  const handleEdgeAdd = useCallback((edge: any) => {
    setEdges([...edges, edge]);
  }, [edges]);

  const handleEdgeDelete = useCallback((edgeId: string) => {
    setEdges(edges.filter(edge => edge.id !== edgeId));
  }, [edges]);

  const handleZoom = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handlePan = useCallback((newPan: { x: number; y: number }) => {
    setPan(newPan);
  }, []);

  return (
    <div className="orchestration-workspace">
      <Toolbar zoom={zoom} onZoom={handleZoom} />
      <div className="workflow-container">
        <NodeLibrary onAddNode={handleNodeAdd} />
        <WorkflowCanvas
          ref={canvasRef}
          nodes={nodes}
          edges={edges}
          selectedNode={selectedNode}
          onNodeSelect={handleNodeSelect}
          onNodeUpdate={handleNodeUpdate}
          onNodeDelete={handleNodeDelete}
          onEdgeAdd={handleEdgeAdd}
          onEdgeDelete={handleEdgeDelete}
          zoom={zoom}
          pan={pan}
          onPan={handlePan}
        />
        <NodeInspector
          node={selectedNode}
          onUpdate={handleNodeUpdate}
          onDelete={handleNodeDelete}
        />
      </div>
    </div>
  );
}
