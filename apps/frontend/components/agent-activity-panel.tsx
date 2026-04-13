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
  usageCount?: number;
  successRate?: number;
  averageExecutionTime?: number;
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
  idle: { backgroundColor: '#e2e8f0' },
  running: { backgroundColor: '#f59e0b', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' },
  completed: { backgroundColor: '#10b981' },
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
                transition: 'all 0.3s ease',
                transform: isSelected ? 'translateX(8px)' : 'none',
                boxShadow: isSelected ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
              }}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '16px',
                  transition: 'all 0.2s ease',
                  borderRadius: '16px'
                }}
                onClick={() => {
                  toggleExpand(agent.id);
                  onAgentClick?.(agent);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ 
                    fontSize: '24px',
                    transition: 'transform 0.3s ease',
                    filter: isSelected ? 'brightness(1.2)' : 'brightness(1)'
                  }}>{info.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: '16px',
                      transition: 'color 0.3s ease',
                      color: isSelected ? 'var(--accent)' : 'var(--ink)'
                    }}>{info.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {agent.section && <span style={{ 
                        fontSize: '12px', 
                        color: 'var(--muted)',
                        backgroundColor: 'var(--panel-alt)',
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>{agent.section}</span>}
                      {agent.perspective && <span style={{ 
                        fontSize: '12px', 
                        color: 'var(--muted)',
                        backgroundColor: 'var(--panel-alt)',
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}>{agent.perspective}视角</span>}
                      {agent.timestamp && (
                        <span style={{ 
                          fontSize: '12px', 
                          color: 'var(--muted)',
                          backgroundColor: 'var(--panel-alt)',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          {new Date(agent.timestamp).toLocaleTimeString()}
                        </span>
                      )}
                      {agent.usageCount !== undefined && (
                        <span style={{ 
                          fontSize: '12px', 
                          color: 'var(--muted)',
                          backgroundColor: 'var(--panel-alt)',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          使用 {agent.usageCount} 次
                        </span>
                      )}
                      {agent.successRate !== undefined && (
                        <span style={{ 
                          fontSize: '12px', 
                          color: agent.successRate > 80 ? '#10b981' : agent.successRate > 50 ? '#f59e0b' : '#ef4444',
                          backgroundColor: 'var(--panel-alt)',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          成功率 {agent.successRate}%
                        </span>
                      )}
                      {agent.averageExecutionTime !== undefined && (
                        <span style={{ 
                          fontSize: '12px', 
                          color: 'var(--muted)',
                          backgroundColor: 'var(--panel-alt)',
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}>
                          平均执行 {agent.averageExecutionTime}s
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
                        boxShadow: '0 0 0 2px white',
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
                  borderTop: '1px solid var(--line)',
                  animation: 'fadeIn 0.3s ease-in-out'
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
