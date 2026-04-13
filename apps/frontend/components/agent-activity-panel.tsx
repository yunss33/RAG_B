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

export function AgentActivityPanel({ agents, onAgentClick, selectedAgentId }: AgentActivityPanelProps) {
  return (
    <div className="panel">
      <h2>智能体活动</h2>
      <div className="stack" style={{ gap: '12px' }}>
        {agents.map((agent) => {
          const info = AGENT_INFO[agent.role as keyof typeof AGENT_INFO] || { name: agent.role, icon: '🤖' };
          const isSelected = selectedAgentId === agent.id;
          return (
            <div
              key={agent.id}
              className={`card cursor-pointer transition-all ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
              onClick={() => onAgentClick?.(agent)}
              style={{ margin: 0 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '24px' }}>{info.icon}</span>
                  <div>
                    <div className="font-semibold">{info.name}</div>
                    {agent.section && <div className="text-sm text-gray-600">{agent.section}</div>}
                    {agent.perspective && <div className="text-sm text-gray-600">{agent.perspective}视角</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${STATUS_COLORS[agent.status as keyof typeof STATUS_COLORS]}`}
                  />
                  <span className="text-sm text-gray-600">
                    {STATUS_LABELS[agent.status as keyof typeof STATUS_LABELS]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
