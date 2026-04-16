'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlowWorkflowCanvas from '@/components/reactflow-workflow-canvas';
import NodeLibrary from '@/components/node-library';
import NodeInspector from '@/components/node-inspector';
import Toolbar from '@/components/workflow-toolbar';
import { getWorkflows, createWorkflow, updateWorkflow, runWorkflow, getMemories, createMemory, updateMemory, deleteMemory } from '@/lib/api';
import MemoryManagement from '@/components/memory-management';
import TeamRelationships from '@/components/team-relationships';

export default function OrchestrationPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [memories, setMemories] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);

  // 加载工作流数据
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const response = await getWorkflows();
        if (response.workflows && response.workflows.length > 0) {
          // 使用第一个工作流
          const workflow = response.workflows[0];
          setWorkflowId(workflow.id);
          setNodes(workflow.agents.map((agent: any) => ({
            id: agent.id,
            type: agent.type,
            position: agent.position,
            data: {
              name: agent.name,
              description: agent.description || '',
              capabilities: agent.capabilities || [],
            },
          })));
          setEdges(workflow.edges.map((edge: any) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label || '',
          })));
        } else {
          // 创建新工作流
          const newWorkflow = await createWorkflow({ name: '默认工作流', description: '智能体编排工作流' });
          setWorkflowId(newWorkflow.workflow_id);
          // 设置默认节点
          const defaultNodes = [
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
          ];
          const defaultEdges = [
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
          ];
          setNodes(defaultNodes);
          setEdges(defaultEdges);
          // 保存默认工作流
          if (newWorkflow.workflow_id) {
            await updateWorkflow(newWorkflow.workflow_id, {
              agents: defaultNodes.map(node => ({
                id: node.id,
                name: node.data.name,
                type: node.type,
                description: node.data.description,
                capabilities: node.data.capabilities,
                position: node.position,
              })),
              edges: defaultEdges,
            });
          }
        }
      } catch (error) {
        console.error('加载工作流失败:', error);
        // 设置默认数据
        const defaultNodes = [
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
        ];
        const defaultEdges = [
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
        ];
        setNodes(defaultNodes);
        setEdges(defaultEdges);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflows();
  }, []);

  // 加载记忆数据
  useEffect(() => {
    const loadMemories = async () => {
      try {
        const response = await getMemories();
        if (response.memories) {
          setMemories(response.memories);
        }
      } catch (error) {
        console.error('加载记忆失败:', error);
      }
    };

    loadMemories();
  }, []);

  // 保存工作流到后端
  useEffect(() => {
    if (!workflowId || isLoading) return;

    const saveWorkflow = async () => {
      try {
        await updateWorkflow(workflowId, {
          agents: nodes.map(node => ({
            id: node.id,
            name: node.data.name,
            type: node.type,
            description: node.data.description,
            capabilities: node.data.capabilities,
            position: node.position,
          })),
          edges: edges,
        });
      } catch (error) {
        console.error('保存工作流失败:', error);
      }
    };

    // 防抖保存
    const timer = setTimeout(saveWorkflow, 1000);
    return () => clearTimeout(timer);
  }, [nodes, edges, workflowId, isLoading]);

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

  const handleRunWorkflow = useCallback(async () => {
    if (!workflowId) return;
    try {
      await runWorkflow(workflowId);
      alert('工作流已启动');
    } catch (error) {
      console.error('运行工作流失败:', error);
      alert('运行工作流失败');
    }
  }, [workflowId]);

  const handleAddMemory = useCallback(async (memoryData: any) => {
    try {
      const newMemory = await createMemory(memoryData);
      setMemories([...memories, newMemory]);
    } catch (error) {
      console.error('添加记忆失败:', error);
      alert('添加记忆失败');
    }
  }, [memories]);

  const handleUpdateMemory = useCallback(async (memory: any) => {
    try {
      await updateMemory(memory.id, memory);
      setMemories(memories.map(m => m.id === memory.id ? memory : m));
    } catch (error) {
      console.error('更新记忆失败:', error);
      alert('更新记忆失败');
    }
  }, [memories]);

  const handleDeleteMemory = useCallback(async (memoryId: string) => {
    try {
      await deleteMemory(memoryId);
      setMemories(memories.filter(m => m.id !== memoryId));
    } catch (error) {
      console.error('删除记忆失败:', error);
      alert('删除记忆失败');
    }
  }, [memories]);

  const handleAddRelationship = useCallback((relationship: any) => {
    setRelationships([...relationships, relationship]);
  }, [relationships]);

  const handleDeleteRelationship = useCallback((index: number) => {
    const newRelationships = [...relationships];
    newRelationships.splice(index, 1);
    setRelationships(newRelationships);
  }, [relationships]);

  return (
    <div className="orchestration-workspace">
      <Toolbar zoom={zoom} onZoom={handleZoom} onRunWorkflow={handleRunWorkflow} />
      <div className="workflow-container">
        <NodeLibrary onAddNode={handleNodeAdd} />
        <ReactFlowWorkflowCanvas
          nodes={nodes}
          edges={edges}
          selectedNode={selectedNode}
          onNodeSelect={handleNodeSelect}
          onNodeUpdate={handleNodeUpdate}
          onNodeDelete={handleNodeDelete}
          onEdgeAdd={handleEdgeAdd}
          onEdgeDelete={handleEdgeDelete}
          onAddNode={handleNodeAdd}
          zoom={zoom}
          pan={pan}
          onPan={handlePan}
        />
        <div className="right-panel">
          <NodeInspector
            node={selectedNode}
            onUpdate={handleNodeUpdate}
            onDelete={handleNodeDelete}
          />
          <MemoryManagement
            agents={nodes.map(node => ({
              id: node.id,
              name: node.data.name,
              type: node.type,
              description: node.data.description,
              capabilities: node.data.capabilities,
            }))}
            memories={memories}
            onAddMemory={handleAddMemory}
            onUpdateMemory={handleUpdateMemory}
            onDeleteMemory={handleDeleteMemory}
          />
          <TeamRelationships
            agents={nodes.map(node => ({
              id: node.id,
              name: node.data.name,
              type: node.type,
              description: node.data.description,
              capabilities: node.data.capabilities,
            }))}
            relationships={relationships}
            onAddRelationship={handleAddRelationship}
            onDeleteRelationship={handleDeleteRelationship}
          />
        </div>
      </div>
    </div>
  );
}
