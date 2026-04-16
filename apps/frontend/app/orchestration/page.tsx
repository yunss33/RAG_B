import { useState } from 'react';
import AgentEditor from '@/components/agent-editor';
import TeamRelationships from '@/components/team-relationships';
import MemoryManagement from '@/components/memory-management';
import AgentFlow from '@/components/agent-flow';

export default function OrchestrationPage() {
  const [agents, setAgents] = useState<any[]>([
    {
      id: '1',
      name: '招标解析智能体',
      type: 'analyzer',
      description: '分析招标文件，提取关键要求',
      capabilities: ['文档解析', '要求提取', '关键词识别'],
    },
    {
      id: '2',
      name: '章节规划智能体',
      type: 'planner',
      description: '根据招标要求生成标书章节结构',
      capabilities: ['结构设计', '内容规划', '逻辑梳理'],
    },
    {
      id: '3',
      name: '章节写作智能体',
      type: 'writer',
      description: '自动生成各章节内容',
      capabilities: ['内容生成', '格式规范', '专业术语'],
    },
  ]);

  const [relationships, setRelationships] = useState<any[]>([
    {
      source: '1',
      target: '2',
      type: 'data',
      description: '传递解析结果',
    },
    {
      source: '2',
      target: '3',
      type: 'instruction',
      description: '传递章节规划',
    },
  ]);

  const [memories, setMemories] = useState<any[]>([
    {
      id: '1',
      name: '招标要求记忆',
      type: 'shared',
      content: '存储招标解析的关键要求',
      access: ['1', '2', '3'],
    },
  ]);

  const handleAddAgent = (agent: any) => {
    setAgents([...agents, { ...agent, id: (agents.length + 1).toString() }]);
  };

  const handleUpdateAgent = (updatedAgent: any) => {
    setAgents(agents.map(agent => agent.id === updatedAgent.id ? updatedAgent : agent));
  };

  const handleDeleteAgent = (agentId: string) => {
    setAgents(agents.filter(agent => agent.id !== agentId));
    setRelationships(relationships.filter(rel => rel.source !== agentId && rel.target !== agentId));
    setMemories(memories.map(memory => ({
      ...memory,
      access: memory.access.filter((id: string) => id !== agentId),
    })));
  };

  const handleAddRelationship = (relationship: any) => {
    setRelationships([...relationships, relationship]);
  };

  const handleDeleteRelationship = (index: number) => {
    setRelationships(relationships.filter((_, i) => i !== index));
  };

  const handleAddMemory = (memory: any) => {
    setMemories([...memories, { ...memory, id: (memories.length + 1).toString() }]);
  };

  const handleUpdateMemory = (updatedMemory: any) => {
    setMemories(memories.map(memory => memory.id === updatedMemory.id ? updatedMemory : memory));
  };

  const handleDeleteMemory = (memoryId: string) => {
    setMemories(memories.filter(memory => memory.id !== memoryId));
  };

  return (
    <div className="grid">
      <section className="panel">
        <h2>智能体编排工作台</h2>
        <p className="muted">创建、管理和编排多个智能体，设置它们之间的关系和共享记忆</p>
      </section>

      <section className="panel">
        <h3>智能体管理</h3>
        <AgentEditor
          agents={agents}
          onAddAgent={handleAddAgent}
          onUpdateAgent={handleUpdateAgent}
          onDeleteAgent={handleDeleteAgent}
        />
      </section>

      <section className="panel">
        <h3>智能体关系</h3>
        <TeamRelationships
          agents={agents}
          relationships={relationships}
          onAddRelationship={handleAddRelationship}
          onDeleteRelationship={handleDeleteRelationship}
        />
      </section>

      <section className="panel">
        <h3>团队记忆</h3>
        <MemoryManagement
          agents={agents}
          memories={memories}
          onAddMemory={handleAddMemory}
          onUpdateMemory={handleUpdateMemory}
          onDeleteMemory={handleDeleteMemory}
        />
      </section>

      <section className="panel full-width">
        <h3>智能体工作流</h3>
        <AgentFlow
          agents={agents}
          relationships={relationships}
        />
      </section>
    </div>
  );
}
