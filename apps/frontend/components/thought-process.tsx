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

  // 计算总持续时间
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

  // 格式化时间
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

  // 格式化持续时间
  const formatDuration = (seconds: number) => {
    if (seconds < 1) return '< 1s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // 切换展开/折叠状态
  const toggleExpand = (index: number) => {
    setIsAnimating(true);
    setExpandedIndex(expandedIndex === index ? null : index);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="panel">
      <div className="flex justify-between items-center mb-4">
        <h2>思考过程</h2>
        {(start_time || end_time) && (
          <div className="text-sm text-gray-600">
            {calculateTotalDuration() > 0 && (
              <span className="pill bg-orange-50 border-orange-200">
                总耗时: {formatDuration(calculateTotalDuration())}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="stack" style={{ gap: '16px' }}>
        {(start_time || end_time) && (
          <div className="card" style={{ margin: 0 }}>
            <div className="text-sm text-gray-600">
              {start_time && <div>开始时间: {formatTime(start_time)}</div>}
              {end_time && <div>结束时间: {formatTime(end_time)}</div>}
            </div>
          </div>
        )}

        {inputData && (
          <div className="card" style={{ margin: 0 }}>
            <h3 className="font-semibold mb-2">📥 输入数据</h3>
            <pre className="text-sm bg-gray-50 p-3 rounded-lg overflow-x-auto">
              {JSON.stringify(inputData, null, 2)}
            </pre>
          </div>
        )}

        {thoughtChain.length > 0 && (
          <div className="card" style={{ margin: 0 }}>
            <h3 className="font-semibold mb-3">🧠 思考链</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="stack" style={{ gap: '16px' }}>
                {thoughtChain.map((thought, index) => (
                  <div key={index} className="relative pl-12">
                    <div 
                      className={`absolute left-2 top-2 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all ${expandedIndex === index ? 'bg-accent scale-110' : 'bg-orange-500'}`}
                    />
                    <div 
                      className={`bg-orange-50 p-4 rounded-lg border border-orange-200 transition-all cursor-pointer ${isAnimating ? 'transition-all duration-300' : ''}`}
                      onClick={() => toggleExpand(index)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-sm">思考 {index + 1}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          {timestamps && timestamps[index] && (
                            <span>{formatTime(timestamps[index])}</span>
                          )}
                          {durations && durations[index] && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded">
                              {formatDuration(durations[index])}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`transition-all duration-300 ${expandedIndex === index ? 'max-h-96 opacity-100' : 'max-h-16 opacity-90 overflow-hidden'}`}>
                        {thought}
                      </div>
                      <div className="mt-2 text-right">
                        <span className={`text-xs text-gray-500 transition-transform ${expandedIndex === index ? 'rotate-180' : ''}`}>
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
            <h3 className="font-semibold mb-3">📝 中间结果</h3>
            <div className="stack" style={{ gap: '12px' }}>
              {intermediateOutputs.map((output, index) => (
                <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-sm font-semibold text-blue-700 mb-2">步骤 {index + 1}</div>
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(output, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {finalOutput && (
          <div className="card" style={{ margin: 0 }}>
            <h3 className="font-semibold mb-2">📤 最终输出</h3>
            <pre className="text-sm bg-green-50 p-3 rounded-lg overflow-x-auto border border-green-200">
              {JSON.stringify(finalOutput, null, 2)}
            </pre>
          </div>
        )}

        {thoughtChain.length === 0 && !inputData && !intermediateOutputs && !finalOutput && (
          <div className="text-center text-gray-500 py-8">
            暂无思考过程记录
          </div>
        )}
      </div>
    </div>
  );
}
