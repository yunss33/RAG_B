'use client';

import { useState } from 'react';

interface Agent {
  id: string;
  role: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  name: string;
  icon: string;
  section?: string;
  perspective?: string;
  thoughts?: string[];
  timestamp?: number;
}

interface AgentActivityPanelProps {
  agents: Agent[];
  onAgentClick?: (agent: Agent) => void;
  selectedAgentId?: string;
}

const AGENT_INFO = {
  parser: { name: '招标文件解析专家', icon: '📋' },
  planner: { name: '章节规划师', icon: '📐' },
  writer: { name: '内容撰写专家', icon: '✍️' },
  reviewer: { name: '质量审查员', icon: '🔍' },
  assembler: { name: '成稿装配师', icon: '📦' },
};

const STATUS_COLORS: Record<string, React.CSSProperties> = {
  idle: { backgroundColor: '#e5e7eb' },
  running: { backgroundColor: '#facc15', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' },
  completed: { backgroundColor: '#22c55e' },
  failed: { backgroundColor: '#ef4444' },
};

const STATUS_LABELS = {
  idle: '空闲',
  running: '运行中',
  completed: '已完成',
  failed: '错误',
};

const STATUS_ICONS = {
  idle: '⏸️',
  running: '▶️',
  completed: '✅',
  failed: '❌',
};

export function AgentActivityPanel({ agents, onAgentClick, selectedAgentId }: AgentActivityPanelProps) {
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);

  const toggleExpand = (agentId: string) => {
    setExpandedAgentId(expandedAgentId === agentId ? null : agentId);
  };

  return (
    <div className="panel">
      <h2>智能体活动</h2>
      <div className="stack" style={{ gap: '12px' }}>
        {agents.map((agent) => {
          const info = AGENT_INFO[agent.role as keyof typeof AGENT_INFO] || { name: agent.role, icon: '🤖' };
          const isSelected = selectedAgentId === agent.id;
          const isExpanded = expandedAgentId === agent.id;

          return (
            <div
              key={agent.id}
              className="card"
              style={{ 
                margin: 0, 
                border: isSelected ? '2px solid #f97316' : '1px solid var(--line)', 
                borderRadius: '18px',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '16px'
                }}
                onClick={() => {
                  toggleExpand(agent.id);
                  onAgentClick?.(agent);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{info.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>{info.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      {agent.section && <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{agent.section}</span>}
                      {agent.perspective && <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{agent.perspective}视角</span>}
                      {agent.timestamp && (
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {new Date(agent.timestamp).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '9999px',
                        ...STATUS_COLORS[agent.status as keyof typeof STATUS_COLORS]
                      }}
                    />
                    <span style={{ fontSize: '14px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {STATUS_ICONS[agent.status as keyof typeof STATUS_ICONS]}
                      {STATUS_LABELS[agent.status as keyof typeof STATUS_LABELS]}
                    </span>
                  </div>
                  <div style={{ color: 'var(--muted)' }}>
                    {isExpanded ? '▼' : '▶'}
                  </div>
                </div>
              </div>
              
              {isExpanded && agent.thoughts && agent.thoughts.length > 0 && (
                <div style={{ 
                  padding: '0 16px 16px', 
                  borderTop: '1px solid var(--line)'
                }}>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>思考过程</div>
                    <div style={{ 
                      backgroundColor: 'var(--panel-alt)', 
                      borderRadius: 'var(--border-radius)', 
                      padding: '12px'
                    }}>
                      {agent.thoughts.map((thought, index) => (
                        <div key={index} style={{ marginBottom: '8px' }}>
                          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>思考 {index + 1}</div>
                          <div style={{ fontSize: '14px' }}>{thought}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
