'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface SkillStat {
  id: string;
  name: string;
  usageCount: number;
  successRate: number;
  averageExecutionTime: number;
  icon: string;
}

interface SkillStatsProps {
  skills: SkillStat[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const SkillStats = React.memo(function SkillStats({ skills }: SkillStatsProps) {
  const [activeTab, setActiveTab] = useState('usage');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
        <p>加载技能统计数据...</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>技能使用统计</h2>
      
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '20px',
        borderBottom: '1px solid var(--line)',
        paddingBottom: '8px'
      }}>
        <button
          onClick={() => setActiveTab('usage')}
          aria-selected={activeTab === 'usage'}
          role="tab"
          aria-controls="usage-tabpanel"
          id="usage-tab"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'usage' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'usage' ? 'white' : 'var(--ink)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveTab('usage');
            }
          }}
        >
          使用次数
        </button>
        <button
          onClick={() => setActiveTab('success')}
          aria-selected={activeTab === 'success'}
          role="tab"
          aria-controls="success-tabpanel"
          id="success-tab"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'success' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'success' ? 'white' : 'var(--ink)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveTab('success');
            }
          }}
        >
          成功率
        </button>
        <button
          onClick={() => setActiveTab('time')}
          aria-selected={activeTab === 'time'}
          role="tab"
          aria-controls="time-tabpanel"
          id="time-tab"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'time' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'time' ? 'white' : 'var(--ink)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveTab('time');
            }
          }}
        >
          执行时间
        </button>
      </div>

      <div style={{ height: '300px', marginBottom: '24px' }}>
        {activeTab === 'usage' && (
          <div id="usage-tabpanel" role="tabpanel" aria-labelledby="usage-tab" aria-hidden={activeTab !== 'usage'}>
            <ResponsiveContainer width="100%" height="100%" aria-label="技能使用次数图表">
              <BarChart data={skills}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="usageCount" name="使用次数" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'success' && (
          <div id="success-tabpanel" role="tabpanel" aria-labelledby="success-tab" aria-hidden={activeTab !== 'success'}>
            <ResponsiveContainer width="100%" height="100%" aria-label="技能成功率图表">
              <BarChart data={skills}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="successRate" name="成功率 (%)" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'time' && (
          <div id="time-tabpanel" role="tabpanel" aria-labelledby="time-tab" aria-hidden={activeTab !== 'time'}>
            <ResponsiveContainer width="100%" height="100%" aria-label="技能执行时间图表">
              <LineChart data={skills}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="averageExecutionTime" name="平均执行时间 (s)" stroke="#FFBB28" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {skills.map((skill, index) => (
          <div
            key={skill.id}
            className="card"
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--line)',
              backgroundColor: 'white',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              outline: 'none'
            }}
            role="button"
            tabIndex={0}
            aria-label={`技能卡片: ${skill.name}`}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // 可以添加点击事件逻辑
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px' }}>{skill.icon}</span>
              <div style={{ fontWeight: 600 }}>{skill.name}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                使用次数: <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{skill.usageCount}</span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                成功率: <span style={{ fontWeight: 600, color: skill.successRate > 80 ? '#10b981' : skill.successRate > 50 ? '#f59e0b' : '#ef4444' }}>{skill.successRate}%</span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                平均执行时间: <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{skill.averageExecutionTime}s</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
