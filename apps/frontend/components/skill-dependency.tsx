'use client';

import React, { useState, useEffect } from 'react';

interface SkillDependency {
  source: string;
  target: string;
  value: number;
}

interface SkillNode {
  name: string;
  icon: string;
  category: string;
}

interface SkillDependencyProps {
  dependencies: SkillDependency[];
  nodes: SkillNode[];
}

const COLORS = {
  parser: '#0088FE',
  planner: '#00C49F',
  writer: '#FFBB28',
  reviewer: '#FF8042',
  assembler: '#8884d8'
};

export const SkillDependency = React.memo(function SkillDependency({ dependencies, nodes }: SkillDependencyProps) {
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
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
        <p>加载技能依赖关系数据...</p>
      </div>
    );
  }

  const getNodeDeps = (nodeName: string) => {
    const outputs = dependencies.filter(d => d.source === nodeName);
    const inputs = dependencies.filter(d => d.target === nodeName);
    return { outputs, inputs };
  };

  return (
    <div className="panel">
      <h2>技能依赖关系</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        {nodes.map((node) => {
          const deps = getNodeDeps(node.name);
          const isSelected = selectedNode === node.name;
          
          return (
            <div
              key={node.name}
              className="card"
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: isSelected ? '2px solid var(--accent)' : '1px solid var(--line)',
                backgroundColor: 'white',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedNode(isSelected ? null : node.name)}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>{node.icon}</span>
                <div style={{ 
                  fontWeight: 600, 
                  fontSize: '16px',
                  color: COLORS[node.category as keyof typeof COLORS] || 'var(--ink)'
                }}>
                  {node.name}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>输出依赖</div>
                  <div style={{ fontWeight: 600 }}>{deps.outputs.length}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>输入依赖</div>
                  <div style={{ fontWeight: 600 }}>{deps.inputs.length}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedNode && (
        <div className="card" style={{ 
          padding: '16px', 
          borderRadius: '12px', 
          border: '1px solid var(--line)',
          backgroundColor: 'white',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <h3 style={{ marginBottom: '12px' }}>技能详情: {selectedNode}</h3>
          
          {(() => {
            const deps = getNodeDeps(selectedNode);
            
            return (
              <>
                {deps.outputs.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--muted)' }}>
                      输出到以下技能
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {deps.outputs.map((dep, i) => (
                        <span key={i} style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: 'var(--panel-alt)',
                          fontSize: '13px',
                          fontWeight: 500
                        }}>
                          {dep.target}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {deps.inputs.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--muted)' }}>
                      来自以下技能的输入
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {deps.inputs.map((dep, i) => (
                        <span key={i} style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: 'var(--panel-alt)',
                          fontSize: '13px',
                          fontWeight: 500
                        }}>
                          {dep.source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      <div style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>依赖关系说明</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {Object.entries(COLORS).map(([category, color]) => (
            <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                borderRadius: '4px', 
                backgroundColor: color
              }} />
              <span style={{ fontSize: '14px' }}>
                {{
                  parser: '招标文件解析专家',
                  planner: '章节规划师',
                  writer: '内容撰写专家',
                  reviewer: '质量审查员',
                  assembler: '成稿装配师'
                }[category]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
