'use client';
import { useState } from 'react';

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: string[];
}

interface Memory {
  id: string;
  name: string;
  type: string;
  content: string;
  access: string[];
}

interface MemoryManagementProps {
  agents: Agent[];
  memories: Memory[];
  onAddMemory: (memory: Omit<Memory, 'id'>) => void;
  onUpdateMemory: (memory: Memory) => void;
  onDeleteMemory: (memoryId: string) => void;
}

export default function MemoryManagement({ agents, memories, onAddMemory, onUpdateMemory, onDeleteMemory }: MemoryManagementProps) {
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [newMemory, setNewMemory] = useState<Omit<Memory, 'id'>>({ 
    name: '',
    type: 'shared',
    content: '',
    access: [],
  });

  const memoryTypes = [
    { value: 'shared', label: '共享记忆' },
    { value: 'team', label: '团队记忆' },
    { value: 'individual', label: '个人记忆' },
  ];

  const handleToggleAgentAccess = (agentId: string) => {
    if (editingMemory) {
      setEditingMemory({
        ...editingMemory,
        access: editingMemory.access.includes(agentId)
          ? editingMemory.access.filter(id => id !== agentId)
          : [...editingMemory.access, agentId],
      });
    } else {
      setNewMemory({
        ...newMemory,
        access: newMemory.access.includes(agentId)
          ? newMemory.access.filter(id => id !== agentId)
          : [...newMemory.access, agentId],
      });
    }
  };

  const handleSaveMemory = () => {
    if (editingMemory) {
      onUpdateMemory(editingMemory);
      setEditingMemory(null);
    } else {
      if (newMemory.name) {
        onAddMemory(newMemory);
        setNewMemory({
          name: '',
          type: 'shared',
          content: '',
          access: [],
        });
      }
    }
  };

  const getMemoryTypeLabel = (type: string) => {
    const memoryType = memoryTypes.find(t => t.value === type);
    return memoryType ? memoryType.label : '未知类型';
  };

  const getAgentNames = (agentIds: string[]) => {
    return agentIds
      .map(id => agents.find(a => a.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="memory-management">
      <div className="card">
        <h4>{editingMemory ? '编辑记忆' : '添加记忆'}</h4>
        <div className="form">
          <div className="form-group">
            <label>名称</label>
            <input
              type="text"
              value={editingMemory?.name || newMemory.name}
              onChange={(e) => {
                if (editingMemory) {
                  setEditingMemory({ ...editingMemory, name: e.target.value });
                } else {
                  setNewMemory({ ...newMemory, name: e.target.value });
                }
              }}
              placeholder="记忆名称"
            />
          </div>
          <div className="form-group">
            <label>类型</label>
            <select
              value={editingMemory?.type || newMemory.type}
              onChange={(e) => {
                if (editingMemory) {
                  setEditingMemory({ ...editingMemory, type: e.target.value });
                } else {
                  setNewMemory({ ...newMemory, type: e.target.value });
                }
              }}
            >
              {memoryTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>内容</label>
            <textarea
              value={editingMemory?.content || newMemory.content}
              onChange={(e) => {
                if (editingMemory) {
                  setEditingMemory({ ...editingMemory, content: e.target.value });
                } else {
                  setNewMemory({ ...newMemory, content: e.target.value });
                }
              }}
              placeholder="记忆内容"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>访问权限</label>
            <div className="agent-access">
              {agents.map((agent) => (
                <div key={agent.id} className="access-item">
                  <input
                    type="checkbox"
                    id={`agent-${agent.id}`}
                    checked={(editingMemory?.access || newMemory.access).includes(agent.id)}
                    onChange={() => handleToggleAgentAccess(agent.id)}
                  />
                  <label htmlFor={`agent-${agent.id}`}>{agent.name}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="actions">
            <button
              type="button"
              className="button"
              onClick={handleSaveMemory}
            >
              {editingMemory ? '保存修改' : '添加记忆'}
            </button>
            {editingMemory && (
              <button
                type="button"
                className="button secondary"
                onClick={() => setEditingMemory(null)}
              >
                取消
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="memories-list">
        <h4>记忆列表</h4>
        {memories.length === 0 ? (
          <p className="muted">还没有记忆，先添加一个。</p>
        ) : (
          <div className="list">
            {memories.map((memory) => (
              <div key={memory.id} className="card memory-card">
                <div>
                  <h5>{memory.name}</h5>
                  <p className="muted">类型：{getMemoryTypeLabel(memory.type)}</p>
                  <p>{memory.content}</p>
                  <div className="access-list">
                    <span className="label">访问权限：</span>
                    <span>{getAgentNames(memory.access) || '无'}</span>
                  </div>
                </div>
                <div className="actions">
                  <button
                    type="button"
                    className="button small"
                    onClick={() => setEditingMemory(memory)}
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    className="button small danger"
                    onClick={() => onDeleteMemory(memory.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
