'use client';

import { useState, useRef, useEffect } from 'react';

interface Task {
  id: string;
  name: string;
  agent: string;
  timestamp: string;
  endTimestamp?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  logId?: string;
  thoughtChain?: string[];
  intermediateOutputs?: any[];
  finalOutput?: any;
  errorMessage?: string;
}

interface TaskTimelineProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  selectedTaskId?: string;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  playbackSpeed?: number;
  onSpeedChange?: (speed: number) => void;
  onTaskJump?: (taskId: string) => void;
  selectedLog?: any;
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

const STATUS_DOTS = {
  pending: 'bg-gray-300',
  running: 'bg-yellow-400 animate-pulse',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

export function TaskTimeline({
  tasks,
  onTaskClick,
  selectedTaskId,
  isPlaying,
  onPlayPause,
  playbackSpeed = 1,
  onSpeedChange,
  onTaskJump,
  selectedLog,
}: TaskTimelineProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // 处理任务点击，切换展开/收起状态
  const handleTaskClick = (task: Task) => {
    if (expandedTaskId === task.id) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(task.id);
    }
    onTaskClick?.(task);
  };

  // 当选中任务变化时，滚动到该任务
  useEffect(() => {
    if (selectedTaskId && timelineRef.current) {
      const selectedElement = document.getElementById(`task-${selectedTaskId}`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedTaskId]);

  // 计算任务执行时间
  const getExecutionTime = (task: Task) => {
    if (!task.timestamp || !task.endTimestamp) return null;
    const start = new Date(task.timestamp);
    const end = new Date(task.endTimestamp);
    const diffMs = end.getTime() - start.getTime();
    const diffSecs = Math.round(diffMs / 1000);
    return `${diffSecs}s`;
  };

  return (
    <div className="panel">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-xl font-semibold mb-3 md:mb-0">任务时间线</h2>
        <div className="flex items-center gap-3">
          {onTaskJump && (
            <div className="flex items-center gap-2">
              <button
                className="button secondary"
                onClick={() => onTaskJump(tasks[0]?.id)}
                disabled={tasks.length === 0}
                style={{ padding: '6px 10px', fontSize: '14px' }}
              >
                ⏮ 开始
              </button>
              <button
                className="button secondary"
                onClick={() => {
                  const currentIndex = tasks.findIndex(t => t.id === selectedTaskId);
                  if (currentIndex > 0) {
                    onTaskJump(tasks[currentIndex - 1].id);
                  }
                }}
                disabled={!selectedTaskId || tasks.findIndex(t => t.id === selectedTaskId) <= 0}
                style={{ padding: '6px 10px', fontSize: '14px' }}
              >
                ⏪ 上一个
              </button>
              <button
                className="button secondary"
                onClick={() => {
                  const currentIndex = tasks.findIndex(t => t.id === selectedTaskId);
                  if (currentIndex < tasks.length - 1) {
                    onTaskJump(tasks[currentIndex + 1].id);
                  }
                }}
                disabled={!selectedTaskId || tasks.findIndex(t => t.id === selectedTaskId) >= tasks.length - 1}
                style={{ padding: '6px 10px', fontSize: '14px' }}
              >
                ⏩ 下一个
              </button>
              <button
                className="button secondary"
                onClick={() => onTaskJump(tasks[tasks.length - 1]?.id)}
                disabled={tasks.length === 0}
                style={{ padding: '6px 10px', fontSize: '14px' }}
              >
                结束 ⏭
              </button>
            </div>
          )}
          {onPlayPause && (
            <button
              className="button secondary"
              onClick={onPlayPause}
              style={{ padding: '8px 16px', fontSize: '14px', minWidth: '80px' }}
            >
              {isPlaying ? '⏸ 暂停' : '▶ 播放'}
            </button>
          )}
          {onSpeedChange && (
            <select
              value={playbackSpeed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              style={{ 
                padding: '8px 12px', 
                fontSize: '14px', 
                margin: 0,
                borderRadius: '12px',
                border: '1px solid var(--line)',
                background: 'white'
              }}
            >
              <option value={0.25}>0.25x</option>
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={4}>4x</option>
            </select>
          )}
        </div>
      </div>
      <div className="relative" ref={timelineRef}>
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="space-y-4">
          {tasks.map((task, index) => {
            const isSelected = selectedTaskId === task.id;
            const isExpanded = expandedTaskId === task.id;
            const executionTime = getExecutionTime(task);
            
            // 找到当前任务的日志
            const taskLog = selectedLog?.id === task.logId ? selectedLog : null;
            
            return (
              <div
                key={task.id}
                id={`task-${task.id}`}
                className={`relative pl-12 transition-all ${isSelected ? 'opacity-100' : 'opacity-80'}`}
              >
                <div 
                  className={`absolute left-2 top-2 w-4 h-4 rounded-full border-2 border-white shadow-sm ${STATUS_DOTS[task.status as keyof typeof STATUS_DOTS]}`} 
                />
                <div
                  className={`card border-2 ${STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]} ${isSelected ? 'ring-2 ring-orange-500' : ''} cursor-pointer`}
                  onClick={() => handleTaskClick(task)}
                  style={{ 
                    margin: 0,
                    transition: 'all 0.2s ease',
                    transform: isSelected ? 'translateX(4px)' : 'none'
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="mb-2 md:mb-0">
                      <div className="font-semibold text-base">{task.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        执行: {task.agent}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{task.timestamp}</div>
                      {executionTime && (
                        <div className="text-sm text-gray-500 mt-1">执行时间: {executionTime}</div>
                      )}
                      <span className="pill mt-2">{STATUS_LABELS[task.status as keyof typeof STATUS_LABELS]}</span>
                    </div>
                  </div>
                </div>
                
                {/* 展开的详细日志 */}
                {isExpanded && taskLog && (
                  <div className="mt-2 ml-4 pl-8 border-l-2 border-gray-200">
                    <div className="card bg-gray-50">
                      <h4 className="font-semibold mb-3">执行详情</h4>
                      
                      {taskLog.thought_chain && taskLog.thought_chain.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">思考过程</h5>
                          <div className="space-y-2 text-sm">
                            {taskLog.thought_chain.map((thought: string, i: number) => (
                              <div key={i} className="bg-white p-2 rounded-lg border border-gray-100">
                                {thought}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {taskLog.intermediate_outputs && taskLog.intermediate_outputs.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">中间输出</h5>
                          <div className="space-y-2 text-sm">
                            {taskLog.intermediate_outputs.map((output: any, i: number) => (
                              <div key={i} className="bg-white p-2 rounded-lg border border-gray-100">
                                <pre className="whitespace-pre-wrap break-words">
                                  {JSON.stringify(output, null, 2)}
                                </pre>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {taskLog.final_output && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">最终输出</h5>
                          <div className="bg-white p-2 rounded-lg border border-gray-100 text-sm">
                            <pre className="whitespace-pre-wrap break-words">
                              {JSON.stringify(taskLog.final_output, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                      
                      {taskLog.error_message && (
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-red-700 mb-2">错误信息</h5>
                          <div className="bg-red-50 p-2 rounded-lg border border-red-200 text-sm text-red-700">
                            {taskLog.error_message}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
