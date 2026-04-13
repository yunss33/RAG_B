'use client';

import React, { useState, useEffect } from 'react';

interface SkillExecution {
  id: string;
  skillName: string;
  timestamp: string;
  status: 'success' | 'failed';
  executionTime: number;
  input: any;
  output: any;
  errorMessage?: string;
}

interface SkillHistoryProps {
  executions: SkillExecution[];
}

export const SkillHistory = React.memo(function SkillHistory({ executions }: SkillHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [filteredExecutions, setFilteredExecutions] = useState<SkillExecution[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'executionTime'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setLoading(false);
      filterAndSortExecutions();
    }, 500);
    return () => clearTimeout(timer);
  }, [executions, selectedSkill, sortBy, sortOrder]);

  const filterAndSortExecutions = () => {
    let filtered = executions;
    
    // 按技能筛选
    if (selectedSkill !== 'all') {
      filtered = filtered.filter(execution => execution.skillName === selectedSkill);
    }
    
    // 排序
    filtered.sort((a, b) => {
      if (sortBy === 'timestamp') {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.executionTime - b.executionTime : b.executionTime - a.executionTime;
      }
    });
    
    setFilteredExecutions(filtered);
  };

  const uniqueSkills = ['all', ...Array.from(new Set(executions.map(execution => execution.skillName)))];

  if (loading) {
    return (
      <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          margin: '0 auto 16px',
          border: '3px solid var(--line)',
          borderTop: '3px solid var(--accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p>加载技能执行历史数据...</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>技能执行历史</h2>
      
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--muted)' }}>技能筛选:</label>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            {uniqueSkills.map(skill => (
              <option key={skill} value={skill}>
                {skill === 'all' ? '全部技能' : skill}
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--muted)' }}>排序方式:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'executionTime')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="timestamp">执行时间</option>
            <option value="executionTime">执行时长</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--muted)' }}>排序顺序:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="desc">降序</option>
            <option value="asc">升序</option>
          </select>
        </div>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {filteredExecutions.length === 0 ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            backgroundColor: 'var(--panel-alt)',
            borderRadius: '12px'
          }}>
            <p>暂无技能执行历史记录</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {filteredExecutions.map((execution) => (
              <div
                key={execution.id}
                className="card"
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{execution.skillName}</div>
                    <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                      {new Date(execution.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: execution.status === 'success' ? '#d1fae5' : '#fee2e2',
                    color: execution.status === 'success' ? '#065f46' : '#b91c1c'
                  }}>
                    {execution.status === 'success' ? '成功' : '失败'}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '14px' }}>
                  <div style={{ color: 'var(--muted)' }}>
                    执行时长: <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{execution.executionTime}s</span>
                  </div>
                </div>
                
                {execution.errorMessage && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    marginBottom: '12px'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#b91c1c', marginBottom: '4px' }}>错误信息</div>
                    <div style={{ fontSize: '13px', color: '#b91c1c' }}>{execution.errorMessage}</div>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--muted)' }}>输入</div>
                    <div style={{ 
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--panel-alt)',
                      wordBreak: 'break-all'
                    }}>
                      {JSON.stringify(execution.input, null, 2)}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--muted)' }}>输出</div>
                    <div style={{ 
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--panel-alt)',
                      wordBreak: 'break-all'
                    }}>
                      {JSON.stringify(execution.output, null, 2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
