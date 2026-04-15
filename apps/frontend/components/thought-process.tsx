'use client';

import { useState, useEffect } from 'react';

interface ThoughtProcessProps {
  thoughtChain: string[];
  inputData?: any;
  intermediateOutputs?: any[];
  finalOutput?: any;
  start_time?: string;
  end_time?: string;
  timestamps?: string[];
  durations?: number[];
}

export function ThoughtProcess({
  thoughtChain,
  inputData,
  intermediateOutputs,
  finalOutput,
  start_time,
  end_time,
  timestamps,
  durations,
}: ThoughtProcessProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const calculateTotalDuration = () => {
    if (durations && durations.length > 0) {
      return durations.reduce((total, duration) => total + duration, 0);
    }
    if (start_time && end_time) {
      const start = new Date(start_time).getTime();
      const end = new Date(end_time).getTime();
      return (end - start) / 1000;
    }
    return 0;
  };

  const formatTime = (time: string) => {
    try {
      const date = new Date(time);
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return time;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 1) return '< 1s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const toggleExpand = (index: number) => {
    setIsAnimating(true);
    setExpandedIndex(expandedIndex === index ? null : index);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="panel">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px'
      }}>
        <h2>思考过程</h2>
        {(start_time || end_time) && (
          <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
            {calculateTotalDuration() > 0 && (
              <span className="pill" style={{ 
                backgroundColor: '#fff7ed', 
                border: '1px solid #fed7aa' 
              }}>
                总耗时: {formatDuration(calculateTotalDuration())}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="stack" style={{ gap: '16px' }}>
        {(start_time || end_time) && (
          <div className="card" style={{ margin: 0 }}>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
              {start_time && <div>开始时间: {formatTime(start_time)}</div>}
              {end_time && <div>结束时间: {formatTime(end_time)}</div>}
            </div>
          </div>
        )}

        {inputData && (
          <div className="card" style={{ margin: 0 }}>
            <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>📥 输入数据</h3>
            <pre style={{ 
              fontSize: '14px', 
              backgroundColor: 'var(--panel-alt)', 
              padding: '12px', 
              borderRadius: 'var(--border-radius)', 
              overflowX: 'auto',
              margin: 0
            }}>
              {JSON.stringify(inputData, null, 2)}
            </pre>
          </div>
        )}

        {thoughtChain.length > 0 && (
          <div className="card" style={{ margin: 0 }}>
            <h3 style={{ fontWeight: 600, marginBottom: '12px' }}>🧠 思考链</h3>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                position: 'absolute', 
                left: '16px', 
                top: 0, 
                bottom: 0, 
                width: '2px', 
                backgroundColor: '#e5e7eb'
              }} />
              <div className="stack" style={{ gap: '16px' }}>
                {thoughtChain.map((thought, index) => (
                  <div key={index} style={{ position: 'relative', paddingLeft: '48px' }}>
                    <div 
                      style={{
                        position: 'absolute',
                        left: '8px',
                        top: '8px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '9999px',
                        border: '2px solid white',
                        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                        transition: 'var(--transition)',
                        backgroundColor: expandedIndex === index ? 'var(--accent)' : '#f97316',
                        transform: expandedIndex === index ? 'scale(1.1)' : 'scale(1)'
                      }}
                    />
                    <div 
                      style={{
                        backgroundColor: '#fff7ed',
                        padding: '16px',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid #fed7aa',
                        transition: 'var(--transition)',
                        cursor: 'pointer'
                      }}
                      onClick={() => toggleExpand(index)}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start', 
                        marginBottom: '8px'
                      }}>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>思考 {index + 1}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {timestamps && timestamps[index] && (
                            <span>{formatTime(timestamps[index])}</span>
                          )}
                          {durations && durations[index] && (
                            <span style={{ 
                              backgroundColor: '#f3f4f6', 
                              paddingLeft: '8px', 
                              paddingRight: '8px', 
                              paddingTop: '2px', 
                              paddingBottom: '2px',
                              borderRadius: '4px'
                            }}>
                              {formatDuration(durations[index])}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ 
                        transition: 'var(--transition)',
                        maxHeight: expandedIndex === index ? '9999px' : '64px',
                        opacity: expandedIndex === index ? 1 : 0.9,
                        overflow: expandedIndex === index ? 'visible' : 'hidden'
                      }}>
                        {thought}
                      </div>
                      <div style={{ marginTop: '8px', textAlign: 'right' }}>
                        <span style={{ 
                          fontSize: '12px', 
                          color: 'var(--muted)', 
                          transition: 'transform 0.3s',
                          display: 'inline-block',
                          transform: expandedIndex === index ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          ▲
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {intermediateOutputs && intermediateOutputs.length > 0 && (
          <div className="card" style={{ margin: 0 }}>
            <h3 style={{ fontWeight: 600, marginBottom: '12px' }}>📝 中间结果</h3>
            <div className="stack" style={{ gap: '12px' }}>
              {intermediateOutputs.map((output, index) => (
                <div key={index} style={{ 
                  backgroundColor: '#eff6ff', 
                  padding: '12px', 
                  borderRadius: 'var(--border-radius)', 
                  border: '1px solid #bfdbfe'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1d4ed8', marginBottom: '8px' }}>
                    步骤 {index + 1}
                  </div>
                  <pre style={{ fontSize: '14px', overflowX: 'auto', margin: 0 }}>
                    {JSON.stringify(output, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {finalOutput && (
          <div className="card" style={{ margin: 0 }}>
            <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>📤 最终输出</h3>
            <pre style={{ 
              fontSize: '14px', 
              backgroundColor: '#f0fdf4', 
              padding: '12px', 
              borderRadius: 'var(--border-radius)', 
              overflowX: 'auto', 
              border: '1px solid #86efac',
              margin: 0
            }}>
              {JSON.stringify(finalOutput, null, 2)}
            </pre>
          </div>
        )}

        {thoughtChain.length === 0 && !inputData && !intermediateOutputs && !finalOutput && (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 0' }}>
            暂无思考过程记录
          </div>
        )}
      </div>
    </div>
  );
}
