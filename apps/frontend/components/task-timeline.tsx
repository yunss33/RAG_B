'use client';

import { useState } from 'react';

interface Task {
  id: string;
  name: string;
  agent: string;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  logId?: string;
}

interface TaskTimelineProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  selectedTaskId?: string;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  playbackSpeed?: number;
  onSpeedChange?: (speed: number) => void;
}

const STATUS_COLORS = {
  pending: 'border-gray-300 bg-gray-100',
  running: 'border-yellow-400 bg-yellow-50',
  completed: 'border-green-500 bg-green-50',
  failed: 'border-red-500 bg-red-50',
};

const STATUS_LABELS = {
  pending: '等待中',
  running: '进行中',
  completed: '已完成',
  failed: '失败',
};

export function TaskTimeline({
  tasks,
  onTaskClick,
  selectedTaskId,
  isPlaying,
  onPlayPause,
  playbackSpeed = 1,
  onSpeedChange,
}: TaskTimelineProps) {
  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ margin: 0 }}>任务时间线</h2>
        <div className="flex items-center gap-2">
          {onPlayPause && (
            <button
              className="button secondary"
              onClick={onPlayPause}
              style={{ padding: '6px 12px', fontSize: '14px' }}
            >
              {isPlaying ? '⏸ 暂停' : '▶ 播放'}
            </button>
          )}
          {onSpeedChange && (
            <select
              value={playbackSpeed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              style={{ padding: '6px 10px', fontSize: '14px', margin: 0 }}
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
            </select>
          )}
        </div>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="stack" style={{ gap: '16px' }}>
          {tasks.map((task, index) => {
            const isSelected = selectedTaskId === task.id;
            return (
              <div
                key={task.id}
                className={`relative pl-12 cursor-pointer transition-all ${isSelected ? 'opacity-100' : 'opacity-90'}`}
                onClick={() => onTaskClick?.(task)}
              >
                <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full border-2 border-white bg-gray-300 shadow-sm" />
                <div
                  className={`card border-2 ${STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]} ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
                  style={{ margin: 0 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{task.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        执行: {task.agent}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{task.timestamp}</div>
                      <span className="pill mt-2">{STATUS_LABELS[task.status as keyof typeof STATUS_LABELS]}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
