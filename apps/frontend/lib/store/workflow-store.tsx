'use client';
import { createContext, useContext, useCallback, useReducer, ReactNode } from 'react';
import { getWorkflows, createWorkflow, updateWorkflow, runWorkflow } from '../api';

// 定义节点状态类型
type NodeStatus = 'idle' | 'running' | 'success' | 'error';

// 定义执行历史项类型
interface ExecutionHistoryItem {
  id: string;
  timestamp: number;
  status: 'success' | 'error';
  nodes: {
    id: string;
    status: NodeStatus;
    result?: any;
    error?: string;
  }[];
}

// 定义模式类型
type Mode = 'workflow' | 'orchestration' | 'multi-agent';

// 定义智能体类型
interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  isMain: boolean;
  capabilities: string[];
}

// 定义状态类型
interface WorkflowState {
  nodes: any[];
  edges: any[];
  selectedNode: any | null;
  zoom: number;
  pan: { x: number; y: number };
  workflowId: string | null;
  isLoading: boolean;
  error: string | null;
  nodeStatuses: Record<string, NodeStatus>;
  executionHistory: ExecutionHistoryItem[];
  currentExecutionId: string | null;
  mode: Mode;
  agents: Agent[];
  selectedAgent: Agent | null;
}

// 定义动作类型
type WorkflowAction =
  | { type: 'SET_NODES'; payload: any[] }
  | { type: 'SET_EDGES'; payload: any[] }
  | { type: 'SET_SELECTED_NODE'; payload: any | null }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: { x: number; y: number } }
  | { type: 'SET_WORKFLOW_ID'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_NODE'; payload: any }
  | { type: 'UPDATE_NODE'; payload: any }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'ADD_EDGE'; payload: any }
  | { type: 'DELETE_EDGE'; payload: string }
  | { type: 'SET_NODE_STATUS'; payload: { nodeId: string; status: NodeStatus } }
  | { type: 'SET_ALL_NODE_STATUS'; payload: NodeStatus }
  | { type: 'START_EXECUTION'; payload: string }
  | { type: 'END_EXECUTION'; payload: { executionId: string; status: 'success' | 'error' } }
  | { type: 'ADD_EXECUTION_HISTORY'; payload: ExecutionHistoryItem }
  | { type: 'SET_MODE'; payload: Mode }
  | { type: 'SET_AGENTS'; payload: Agent[] }
  | { type: 'ADD_AGENT'; payload: Agent }
  | { type: 'UPDATE_AGENT'; payload: Agent }
  | { type: 'DELETE_AGENT'; payload: string }
  | { type: 'SET_SELECTED_AGENT'; payload: Agent | null };

// 初始状态
const initialState: WorkflowState = {
  nodes: [],
  edges: [],
  selectedNode: null,
  zoom: 1,
  pan: { x: 0, y: 0 },
  workflowId: null,
  isLoading: true,
  error: null,
  nodeStatuses: {},
  executionHistory: [],
  currentExecutionId: null,
  mode: 'workflow',
  agents: [
    {
      id: '1',
      name: '总协调智能体',
      type: 'coordinator',
      description: '负责协调其他智能体的工作，分配任务和整合结果',
      isMain: true,
      capabilities: ['任务分配', '结果整合', '流程协调'],
    },
    {
      id: '2',
      name: '分析智能体',
      type: 'analyzer',
      description: '分析数据和文档，提取关键信息',
      isMain: false,
      capabilities: ['数据解析', '信息提取', '模式识别'],
    },
    {
      id: '3',
      name: '规划智能体',
      type: 'planner',
      description: '制定计划和策略，优化工作流程',
      isMain: false,
      capabilities: ['计划制定', '策略优化', '资源分配'],
    },
    {
      id: '4',
      name: '执行智能体',
      type: 'general',
      description: '执行具体任务，完成工作流程中的操作',
      isMain: false,
      capabilities: ['任务执行', '操作处理', '结果生成'],
    },
  ],
  selectedAgent: null,
};

// Reducer 函数
function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'SET_NODES':
      return { ...state, nodes: action.payload };
    case 'SET_EDGES':
      return { ...state, edges: action.payload };
    case 'SET_SELECTED_NODE':
      return { ...state, selectedNode: action.payload };
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };
    case 'SET_PAN':
      return { ...state, pan: action.payload };
    case 'SET_WORKFLOW_ID':
      return { ...state, workflowId: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_NODE':
      return { ...state, nodes: [...state.nodes, action.payload] };
    case 'UPDATE_NODE':
      return {
        ...state,
        nodes: state.nodes.map(node => node.id === action.payload.id ? action.payload : node),
      };
    case 'DELETE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter(node => node.id !== action.payload),
        edges: state.edges.filter(edge => edge.source !== action.payload && edge.target !== action.payload),
        selectedNode: state.selectedNode?.id === action.payload ? null : state.selectedNode,
      };
    case 'ADD_EDGE':
      return { ...state, edges: [...state.edges, action.payload] };
    case 'DELETE_EDGE':
      return { ...state, edges: state.edges.filter(edge => edge.id !== action.payload) };
    case 'SET_NODE_STATUS':
      return {
        ...state,
        nodeStatuses: {
          ...state.nodeStatuses,
          [action.payload.nodeId]: action.payload.status,
        },
      };
    case 'SET_ALL_NODE_STATUS':
      const newNodeStatuses: Record<string, NodeStatus> = {};
      state.nodes.forEach(node => {
        newNodeStatuses[node.id] = action.payload;
      });
      return {
        ...state,
        nodeStatuses: newNodeStatuses,
      };
    case 'START_EXECUTION':
      return {
        ...state,
        currentExecutionId: action.payload,
      };
    case 'END_EXECUTION':
      return {
        ...state,
        currentExecutionId: null,
      };
    case 'ADD_EXECUTION_HISTORY':
      return {
        ...state,
        executionHistory: [action.payload, ...state.executionHistory],
      };
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
      };
    case 'SET_AGENTS':
      return {
        ...state,
        agents: action.payload,
      };
    case 'ADD_AGENT':
      return {
        ...state,
        agents: [...state.agents, action.payload],
      };
    case 'UPDATE_AGENT':
      return {
        ...state,
        agents: state.agents.map(agent => agent.id === action.payload.id ? action.payload : agent),
      };
    case 'DELETE_AGENT':
      return {
        ...state,
        agents: state.agents.filter(agent => agent.id !== action.payload),
        selectedAgent: state.selectedAgent?.id === action.payload ? null : state.selectedAgent,
      };
    case 'SET_SELECTED_AGENT':
      return {
        ...state,
        selectedAgent: action.payload,
      };
    default:
      return state;
  }
}

// Context 类型
interface WorkflowContextType {
  state: WorkflowState;
  dispatch: React.Dispatch<WorkflowAction>;
  loadWorkflows: () => Promise<void>;
  saveWorkflow: () => Promise<void>;
  runWorkflow: () => Promise<void>;
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNode: (node: any) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (edge: any) => void;
  deleteEdge: (edgeId: string) => void;
  selectNode: (node: any) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setNodeStatus: (nodeId: string, status: NodeStatus) => void;
  setAllNodeStatus: (status: NodeStatus) => void;
  getNodeStatus: (nodeId: string) => NodeStatus;
  setMode: (mode: Mode) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (agent: Agent) => void;
  deleteAgent: (agentId: string) => void;
  selectAgent: (agent: Agent | null) => void;
}

// 创建 Context
const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

// Provider 组件
interface WorkflowProviderProps {
  children: ReactNode;
}

export function WorkflowProvider({ children }: WorkflowProviderProps) {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  // 加载工作流数据
  const loadWorkflows = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const response = await getWorkflows();
      if (response.workflows && response.workflows.length > 0) {
        // 使用第一个工作流
        const workflow = response.workflows[0];
        dispatch({ type: 'SET_WORKFLOW_ID', payload: workflow.id });
        dispatch({ 
          type: 'SET_NODES', 
          payload: workflow.agents.map((agent: any) => ({
            id: agent.id,
            type: agent.type,
            position: agent.position,
            data: {
              name: agent.name,
              description: agent.description || '',
              capabilities: agent.capabilities || [],
            },
          })) 
        });
        dispatch({ 
          type: 'SET_EDGES', 
          payload: workflow.edges.map((edge: any) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label || '',
          })) 
        });
      } else {
        // 创建新工作流
        const newWorkflow = await createWorkflow({ name: '默认工作流', description: '智能体编排工作流' });
        dispatch({ type: 'SET_WORKFLOW_ID', payload: newWorkflow.workflow_id });
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
        dispatch({ type: 'SET_NODES', payload: defaultNodes });
        dispatch({ type: 'SET_EDGES', payload: defaultEdges });
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
      dispatch({ type: 'SET_ERROR', payload: '加载工作流失败' });
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
      dispatch({ type: 'SET_NODES', payload: defaultNodes });
      dispatch({ type: 'SET_EDGES', payload: defaultEdges });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // 保存工作流
  const saveWorkflow = useCallback(async () => {
    if (!state.workflowId || state.isLoading) return;

    try {
      await updateWorkflow(state.workflowId, {
        agents: state.nodes.map(node => ({
          id: node.id,
          name: node.data.name,
          type: node.type,
          description: node.data.description,
          capabilities: node.data.capabilities,
          position: node.position,
        })),
        edges: state.edges,
      });
    } catch (error) {
      console.error('保存工作流失败:', error);
      dispatch({ type: 'SET_ERROR', payload: '保存工作流失败' });
    }
  }, [state.workflowId, state.nodes, state.edges, state.isLoading]);

  // 运行工作流
  const handleRunWorkflow = useCallback(async () => {
    if (!state.workflowId) return;
    
    try {
      // 生成执行ID
      const executionId = Date.now().toString();
      
      // 开始执行
      dispatch({ type: 'START_EXECUTION', payload: executionId });
      dispatch({ type: 'SET_ALL_NODE_STATUS', payload: 'idle' });
      
      // 模拟工作流执行过程
      const executionNodes = state.nodes.map(node => ({
        id: node.id,
        status: 'running' as NodeStatus,
      }));
      
      // 模拟每个节点的执行
      for (const node of state.nodes) {
        dispatch({ type: 'SET_NODE_STATUS', payload: { nodeId: node.id, status: 'running' } });
        // 模拟执行延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        dispatch({ type: 'SET_NODE_STATUS', payload: { nodeId: node.id, status: 'success' } });
      }
      
      // 结束执行
      dispatch({ type: 'END_EXECUTION', payload: { executionId, status: 'success' } });
      
      // 添加执行历史
      const executionHistoryItem: ExecutionHistoryItem = {
        id: executionId,
        timestamp: Date.now(),
        status: 'success',
        nodes: state.nodes.map(node => ({
          id: node.id,
          status: 'success',
        })),
      };
      dispatch({ type: 'ADD_EXECUTION_HISTORY', payload: executionHistoryItem });
      
      alert('工作流执行成功');
    } catch (error) {
      console.error('运行工作流失败:', error);
      dispatch({ type: 'SET_ERROR', payload: '运行工作流失败' });
      alert('运行工作流失败');
    }
  }, [state.workflowId, state.nodes]);

  // 设置节点状态
  const setNodeStatus = useCallback((nodeId: string, status: NodeStatus) => {
    dispatch({ type: 'SET_NODE_STATUS', payload: { nodeId, status } });
  }, []);

  // 设置所有节点状态
  const setAllNodeStatus = useCallback((status: NodeStatus) => {
    dispatch({ type: 'SET_ALL_NODE_STATUS', payload: status });
  }, []);

  // 获取节点状态
  const getNodeStatus = useCallback((nodeId: string) => {
    return state.nodeStatuses[nodeId] || 'idle';
  }, [state.nodeStatuses]);

  // 设置模式
  const setMode = useCallback((mode: Mode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  // 添加智能体
  const addAgent = useCallback((agent: Agent) => {
    dispatch({ type: 'ADD_AGENT', payload: agent });
  }, []);

  // 更新智能体
  const updateAgent = useCallback((agent: Agent) => {
    dispatch({ type: 'UPDATE_AGENT', payload: agent });
  }, []);

  // 删除智能体
  const deleteAgent = useCallback((agentId: string) => {
    dispatch({ type: 'DELETE_AGENT', payload: agentId });
  }, []);

  // 选择智能体
  const selectAgent = useCallback((agent: Agent | null) => {
    dispatch({ type: 'SET_SELECTED_AGENT', payload: agent });
  }, []);

  // 添加节点
  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    console.log('Adding node:', { type, position });
    // 使用时间戳生成唯一ID
    const newNode = {
      id: Date.now().toString(),
      type,
      position,
      data: {
        name: `${type}智能体`,
        description: '',
        capabilities: [],
      },
    };
    console.log('New node:', newNode);
    dispatch({ type: 'ADD_NODE', payload: newNode });
  }, []);

  // 更新节点
  const updateNode = useCallback((node: any) => {
    dispatch({ type: 'UPDATE_NODE', payload: node });
  }, []);

  // 删除节点
  const deleteNode = useCallback((nodeId: string) => {
    dispatch({ type: 'DELETE_NODE', payload: nodeId });
  }, []);

  // 添加边
  const addEdge = useCallback((edge: any) => {
    dispatch({ type: 'ADD_EDGE', payload: edge });
  }, []);

  // 删除边
  const deleteEdge = useCallback((edgeId: string) => {
    dispatch({ type: 'DELETE_EDGE', payload: edgeId });
  }, []);

  // 选择节点
  const selectNode = useCallback((node: any) => {
    dispatch({ type: 'SET_SELECTED_NODE', payload: node });
  }, []);

  // 设置缩放
  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, []);

  // 设置平移
  const setPan = useCallback((pan: { x: number; y: number }) => {
    dispatch({ type: 'SET_PAN', payload: pan });
  }, []);

  const value = {
    state,
    dispatch,
    loadWorkflows,
    saveWorkflow,
    runWorkflow: handleRunWorkflow,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    deleteEdge,
    selectNode,
    setZoom,
    setPan,
    setNodeStatus,
    setAllNodeStatus,
    getNodeStatus,
    setMode,
    addAgent,
    updateAgent,
    deleteAgent,
    selectAgent,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

// 自定义 Hook
export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}
