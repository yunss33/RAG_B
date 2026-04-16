'use client';
import React from 'react';

type Mode = 'workflow' | 'orchestration' | 'multi-agent';

interface ModeSwitcherProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function ModeSwitcher({ currentMode, onModeChange }: ModeSwitcherProps) {
  const modes: { value: Mode; label: string; icon: string }[] = [
    { value: 'workflow', label: '工作流', icon: '📋' },
    { value: 'orchestration', label: '编排', icon: '🔄' },
    { value: 'multi-agent', label: '多智能体', icon: '🤖' },
  ];

  return (
    <div className="mode-switcher">
      <div className="mode-tabs">
        {modes.map((mode) => (
          <button
            key={mode.value}
            className={`mode-tab ${currentMode === mode.value ? 'active' : ''}`}
            onClick={() => onModeChange(mode.value)}
          >
            <span className="mode-icon">{mode.icon}</span>
            <span className="mode-label">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
