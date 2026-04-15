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

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  pending: { borderColor: '#d1d5db', backgroundColor: '#f3f4f6' },
  running: { borderColor: '#facc15', backgroundColor: '#fefce8' },
  completed: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  failed: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
};

const STATUS_LABELS = {
  pending: '等待中',
  running: '进行中',
  completed: '已完成',
  failed: '失败',
};

const STATUS_DOT_STYLES: Record<string, React.CSSProperties> = {
  pending: { backgroundColor: '#d1d5db' },
  running: { backgroundColor: '#facc15', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' },
  completed: { backgroundColor: '#22c55e' },
  failed: { backgroundColor: '#ef4444' },
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

  const handleTaskClick = (task: Task) => {
    if (expandedTaskId === task.id) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(task.id);
    }
    onTaskClick?.(task);
  };

  useEffect(() => {
    if (selectedTaskId && timelineRef.current) {
      const selectedElement = document.getElementById(`task-${selectedTaskId}`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedTaskId]);

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
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <h2>任务时间线</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {onTaskJump && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="button secondary"
                onClick={() => onTaskJump(tasks[0]?.id)}
                disabled={tasks.length === 0}
                style={{ 
                  padding: '6px 10px', 
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  borderRadius: '12px',
                  border: '1px solid var(--line)'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--accent-light)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
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
                style={{ 
                  padding: '6px 10px', 
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  borderRadius: '12px',
                  border: '1px solid var(--line)'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--accent-light)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
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
                style={{ 
                  padding: '6px 10px', 
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  borderRadius: '12px',
                  border: '1px solid var(--line)'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--accent-light)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                ⏩ 下一个
              </button>
              <button
                className="button secondary"
                onClick={() => onTaskJump(tasks[tasks.length - 1]?.id)}
                disabled={tasks.length === 0}
                style={{ 
                  padding: '6px 10px', 
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  borderRadius: '12px',
                  border: '1px solid var(--line)'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--accent-light)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                结束 ⏭
              </button>
            </div>
          )}
          {onPlayPause && (
            <button
              className="button secondary"
              onClick={onPlayPause}
              style={{ 
                padding: '8px 16px', 
                fontSize: '14px', 
                minWidth: '80px',
                transition: 'all 0.2s ease',
                borderRadius: '12px',
                border: '1px solid var(--line)',
                backgroundColor: isPlaying ? 'var(--accent-light)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
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
                background: 'white',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)';
                e.currentTarget.style.boxShadow = 'none';
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
      <div style={{ position: 'relative' }} ref={timelineRef}>
        <div style={{ 
          position: 'absolute', 
          left: '16px', 
          top: 0, 
          bottom: 0, 
          width: '2px', 
          backgroundColor: '#e5e7eb'
        }} />
        <div style={{ display: 'grid', gap: '16px' }}>
          {tasks.map((task, index) => {
            const isSelected = selectedTaskId === task.id;
            const isExpanded = expandedTaskId === task.id;
            const executionTime = getExecutionTime(task);
            
            const taskLog = selectedLog?.id === task.logId ? selectedLog : null;
            
            return (
              <div
                key={task.id}
                id={`task-${task.id}`}
                style={{ 
                  position: 'relative', 
                  paddingLeft: '48px', 
                  transition: 'var(--transition)',
                  opacity: isSelected ? 1 : 0.8
                }}
              >
                <div 
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '8px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '9999px',
                    border: '2px solid white',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.1), 0 0 0 2px rgba(255, 255, 255, 0.8)',
                    ...STATUS_DOT_STYLES[task.status as keyof typeof STATUS_DOT_STYLES],
                    transition: 'all 0.3s ease',
                    transform: isSelected ? 'scale(1.2)' : 'scale(1)'
                  }}
                />
                <div
                  className="card"
                  onClick={() => handleTaskClick(task)}
                  style={{ 
                    margin: 0,
                    border: `2px solid`,
                    ...STATUS_STYLES[task.status as keyof typeof STATUS_STYLES],
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 2px #f97316, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
                    transform: isSelected ? 'translateX(8px)' : 'none',
                    transition: 'all 0.3s ease',
                    borderRadius: '16px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = isSelected ? 'translateX(8px) scale(1.02)' : 'translateX(4px) scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = isSelected ? 'translateX(8px)' : 'none';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '16px' }}>{task.name}</div>
                      <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
                        执行: {task.agent}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', color: 'var(--muted)' }}>{task.timestamp}</div>
                      {executionTime && (
                        <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
                          执行时间: {executionTime}
                        </div>
                      )}
                      <span className="pill" style={{ marginTop: '8px', display: 'inline-block' }}>
                        {STATUS_LABELS[task.status as keyof typeof STATUS_LABELS]}
                      </span>
                    </div>
                  </div>
                </div>
                
                {isExpanded && taskLog && (
                  <div style={{ 
                    marginTop: '8px', 
                    marginLeft: '16px', 
                    paddingLeft: '32px', 
                    borderLeft: '2px solid #e5e7eb',
                    animation: 'fadeIn 0.3s ease-in-out'
                  }}>
                    <div className="card" style={{ margin: 0, backgroundColor: 'var(--panel-alt)' }}>
                      <h4 style={{ fontWeight: 600, marginBottom: '12px' }}>执行详情</h4>
                      
                      {taskLog.thought_chain && taskLog.thought_chain.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                          <h5 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>
                            思考过程
                          </h5>
                          <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                            {taskLog.thought_chain.map((thought: string, i: number) => (
                              <div key={i} style={{ 
                                backgroundColor: 'white', 
                                padding: '12px', 
                                borderRadius: '12px', 
                                border: '1px solid var(--line)',
                                transition: 'all 0.3s ease',
                                animation: `fadeIn 0.3s ease-in-out ${i * 0.1}s both`
                              }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                  <div style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    borderRadius: '50%', 
                                    backgroundColor: 'var(--accent-light)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: 'var(--accent)'
                                  }}>
                                    {i + 1}
                                  </div>
                                  <div style={{ flex: 1 }}>{thought}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {taskLog.intermediate_outputs && taskLog.intermediate_outputs.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                          <h5 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>
                            中间输出
                          </h5>
                          <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                            {taskLog.intermediate_outputs.map((output: any, i: number) => (
                              <div key={i} style={{ 
                                backgroundColor: 'white', 
                                padding: '12px', 
                                borderRadius: '12px', 
                                border: '1px solid var(--line)',
                                transition: 'all 0.3s ease',
                                animation: `fadeIn 0.3s ease-in-out ${0.5 + i * 0.1}s both`
                              }}>
                                <div style={{ marginBottom: '8px', fontWeight: 600, fontSize: '13px', color: 'var(--muted)' }}>
                                  输出 {i + 1}
                                </div>
                                <pre style={{ 
                                  whiteSpace: 'pre-wrap', 
                                  wordBreak: 'break-word', 
                                  margin: 0, 
                                  fontSize: '13px',
                                  lineHeight: '1.4',
                                  color: 'var(--ink)'
                                }}>
                                  {JSON.stringify(output, null, 2)}
                                </pre>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                       
                      {taskLog.final_output && (
                        <div style={{ marginBottom: '16px' }}>
                          <h5 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: '8px' }}>
                            最终输出
                          </h5>
                          <div style={{ 
                            backgroundColor: 'white', 
                            padding: '12px', 
                            borderRadius: '12px', 
                            border: '1px solid var(--accent-light)',
                            fontSize: '14px',
                            animation: 'fadeIn 0.3s ease-in-out 0.8s both'
                          }}>
                            <pre style={{ 
                              whiteSpace: 'pre-wrap', 
                              wordBreak: 'break-word', 
                              margin: 0, 
                              fontSize: '13px',
                              lineHeight: '1.4',
                              color: 'var(--ink)'
                            }}>
                              {JSON.stringify(taskLog.final_output, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                      
                      {taskLog.error_message && (
                        <div style={{ marginBottom: '16px' }}>
                          <h5 style={{ fontSize: '14px', fontWeight: 500, color: '#991b1b', marginBottom: '8px' }}>
                            错误信息
                          </h5>
                          <div style={{ 
                            backgroundColor: '#fef2f2', 
                            padding: '8px', 
                            borderRadius: 'var(--border-radius)', 
                            border: '1px solid #fca5a5',
                            fontSize: '14px',
                            color: '#991b1b'
                          }}>
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
