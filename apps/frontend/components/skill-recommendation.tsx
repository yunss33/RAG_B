'use client';

import React, { useState, useEffect } from 'react';

interface RecommendedSkill {
  id: string;
  name: string;
  icon: string;
  reason: string;
  relevance: number;
  usageCount: number;
  successRate: number;
}

interface SkillRecommendationProps {
  recommendedSkills: RecommendedSkill[];
  onSkillClick?: (skill: RecommendedSkill) => void;
}

export const SkillRecommendation = React.memo(function SkillRecommendation({ recommendedSkills, onSkillClick }: SkillRecommendationProps) {
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
      <div className="panel" style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ 
          width: '30px', 
          height: '30px', 
          margin: '0 auto 12px',
          border: '2px solid var(--line)',
          borderTop: '2px solid var(--accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontSize: '14px' }}>加载推荐技能...</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>推荐技能</h2>
      
      {recommendedSkills.length === 0 ? (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          backgroundColor: 'var(--panel-alt)',
          borderRadius: '12px',
          fontSize: '14px',
          color: 'var(--muted)'
        }}>
          暂无推荐技能
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {recommendedSkills.map((skill) => (
            <div
              key={skill.id}
              className="card"
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--line)',
                backgroundColor: 'white',
                transition: 'all 0.3s ease',
                cursor: onSkillClick ? 'pointer' : 'default'
              }}
              onClick={() => onSkillClick?.(skill)}
              onMouseEnter={(e) => {
                if (onSkillClick) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (onSkillClick) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>{skill.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{skill.name}</div>
                  <div style={{ fontSize: '14px', color: 'var(--muted)' }}>{skill.reason}</div>
                </div>
                <div style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: skill.relevance > 70 ? '#d1fae5' : skill.relevance > 40 ? '#fef3c7' : '#fee2e2',
                  color: skill.relevance > 70 ? '#065f46' : skill.relevance > 40 ? '#92400e' : '#b91c1c'
                }}>
                  相关度 {skill.relevance}%
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                <div style={{ color: 'var(--muted)' }}>
                  使用次数: <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{skill.usageCount}</span>
                </div>
                <div style={{ color: 'var(--muted)' }}>
                  成功率: <span style={{ color: skill.successRate > 80 ? '#10b981' : skill.successRate > 50 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>{skill.successRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
        <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
          <p>技能推荐基于您的使用历史和项目需求，帮助您更高效地完成任务。</p>
        </div>
      </div>
    </div>
  );
});
