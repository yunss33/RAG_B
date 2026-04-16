'use client';
import React from 'react';

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  isMain: boolean;
}

interface MultiAgentViewProps {
  agents: Agent[];
  onAgentSelect: (agent: Agent) => void;
  selectedAgent: Agent | null;
}

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

export default function MultiAgentView({ agents, onAgentSelect, selectedAgent }: MultiAgentViewProps) {
  const mainAgent = agents.find(agent => agent.isMain);
  const otherAgents = agents.filter(agent => !agent.isMain);

  return (
    <div className="multi-agent-view">
      <h3>多智能体团队</h3>
      
      {/* 总智能体 */}
      {mainAgent && (
        <div 
          className={`agent-card main-agent ${selectedAgent?.id === mainAgent.id ? 'selected' : ''}`}
          style={{
            borderColor: getAgentTypeColor(mainAgent.type)
          }}
          onClick={() => onAgentSelect(mainAgent)}
        >
          <div className="agent-header">
            <h4>总智能体</h4>
            <span 
              className="agent-type"
              style={{
                background: getAgentTypeColor(mainAgent.type),
                color: 'white'
              }}
            >
              {mainAgent.type}
            </span>
          </div>
          <h5>{mainAgent.name}</h5>
          <p className="agent-description">{mainAgent.description}</p>
          <div className="agent-indicator">
            <span className="main-badge">总</span>
          </div>
        </div>
      )}

      {/* 其他智能体 */}
      <div className="other-agents">
        <h4>团队成员</h4>
        <div className="agent-grid">
          {otherAgents.map((agent) => (
            <div 
              key={agent.id}
              className={`agent-card ${selectedAgent?.id === agent.id ? 'selected' : ''}`}
              style={{
                borderColor: getAgentTypeColor(agent.type)
              }}
              onClick={() => onAgentSelect(agent)}
            >
              <div className="agent-header">
                <span 
                  className="agent-type"
                  style={{
                    background: getAgentTypeColor(agent.type),
                    color: 'white'
                  }}
                >
                  {agent.type}
                </span>
              </div>
              <h5>{agent.name}</h5>
              <p className="agent-description">{agent.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
