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

const STATUS_COLORS = {
  idle: 'bg-gray-200',
  running: 'bg-yellow-400 animate-pulse',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
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
              className={`card cursor-pointer transition-all ${isSelected ? 'ring-2 ring-orange-500' : ''} hover:shadow-sm`}
              style={{ margin: 0, border: '1px solid var(--line)', borderRadius: '18px' }}
            >
              <div 
                className="flex items-center justify-between p-4"
                onClick={() => {
                  toggleExpand(agent.id);
                  onAgentClick?.(agent);
                }}
              >
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '24px' }}>{info.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-base">{info.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {agent.section && <span className="text-xs text-gray-600">{agent.section}</span>}
                      {agent.perspective && <span className="text-xs text-gray-600">{agent.perspective}视角</span>}
                      {agent.timestamp && (
                        <span className="text-xs text-gray-500">
                          {new Date(agent.timestamp).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${STATUS_COLORS[agent.status as keyof typeof STATUS_COLORS]}`}
                    />
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      {STATUS_ICONS[agent.status as keyof typeof STATUS_ICONS]}
                      {STATUS_LABELS[agent.status as keyof typeof STATUS_LABELS]}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    {isExpanded ? '▼' : '▶'}
                  </div>
                </div>
              </div>
              
              {isExpanded && agent.thoughts && agent.thoughts.length > 0 && (
                <div className="px-4 pb-4 border-t border-gray-200">
                  <div className="mt-3">
                    <div className="text-sm font-semibold mb-2">思考过程</div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      {agent.thoughts.map((thought, index) => (
                        <div key={index} className="mb-2 last:mb-0">
                          <div className="text-xs text-gray-500 mb-1">思考 {index + 1}</div>
                          <div className="text-sm">{thought}</div>
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
