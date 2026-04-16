'use client';
import { useState } from 'react';

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  capabilities: string[];
}

interface Relationship {
  source: string;
  target: string;
  type: string;
  description: string;
}

interface TeamRelationshipsProps {
  agents: Agent[];
  relationships: Relationship[];
  onAddRelationship: (relationship: Relationship) => void;
  onDeleteRelationship: (index: number) => void;
}

export default function TeamRelationships({ agents, relationships, onAddRelationship, onDeleteRelationship }: TeamRelationshipsProps) {
  const [newRelationship, setNewRelationship] = useState<Relationship>({
    source: '',
    target: '',
    type: 'data',
    description: '',
  });

  const relationshipTypes = [
    { value: 'data', label: '数据传递' },
    { value: 'instruction', label: '指令传递' },
    { value: 'coordination', label: '协调关系' },
    { value: 'supervision', label: '监督关系' },
  ];

  const handleAddRelationship = () => {
    if (newRelationship.source && newRelationship.target && newRelationship.source !== newRelationship.target) {
      onAddRelationship(newRelationship);
      setNewRelationship({
        source: '',
        target: '',
        type: 'data',
        description: '',
      });
    }
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : '未知智能体';
  };

  const getRelationshipTypeLabel = (type: string) => {
    const relationshipType = relationshipTypes.find(t => t.value === type);
    return relationshipType ? relationshipType.label : '未知类型';
  };

  return (
    <div className="team-relationships">
      <div className="card">
        <h4>添加关系</h4>
        <div className="form">
          <div className="form-group">
            <label>源智能体</label>
            <select
              value={newRelationship.source}
              onChange={(e) => setNewRelationship({ ...newRelationship, source: e.target.value })}
            >
              <option value="">选择智能体</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>目标智能体</label>
            <select
              value={newRelationship.target}
              onChange={(e) => setNewRelationship({ ...newRelationship, target: e.target.value })}
            >
              <option value="">选择智能体</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>关系类型</label>
            <select
              value={newRelationship.type}
              onChange={(e) => setNewRelationship({ ...newRelationship, type: e.target.value })}
            >
              {relationshipTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>描述</label>
            <input
              type="text"
              value={newRelationship.description}
              onChange={(e) => setNewRelationship({ ...newRelationship, description: e.target.value })}
              placeholder="关系描述"
            />
          </div>
          <div className="actions">
            <button
              type="button"
              className="button"
              onClick={handleAddRelationship}
              disabled={!newRelationship.source || !newRelationship.target || newRelationship.source === newRelationship.target}
            >
              添加关系
            </button>
          </div>
        </div>
      </div>

      <div className="relationships-list">
        <h4>关系列表</h4>
        {relationships.length === 0 ? (
          <p className="muted">还没有关系，先添加一个。</p>
        ) : (
          <div className="list">
            {relationships.map((relationship, index) => (
              <div key={index} className="card relationship-card">
                <div className="relationship-info">
                  <div className="relationship-arrow">
                    <span>{getAgentName(relationship.source)}</span>
                    <span className="arrow">→</span>
                    <span>{getAgentName(relationship.target)}</span>
                  </div>
                  <div className="relationship-details">
                    <p className="muted">类型：{getRelationshipTypeLabel(relationship.type)}</p>
                    <p>{relationship.description}</p>
                  </div>
                </div>
                <div className="actions">
                  <button
                    type="button"
                    className="button small danger"
                    onClick={() => onDeleteRelationship(index)}
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
