'use client';

import React, { useState, useEffect } from 'react';
import {
  Sankey,
  SankeyNode,
  SankeyLink,
  ResponsiveContainer
} from 'recharts';

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
        <p>加载技能依赖关系数据...</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>技能依赖关系</h2>
      
      <div style={{ height: '400px', marginBottom: '24px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={{
              nodes: nodes.map(node => ({
                name: node.name,
                icon: node.icon,
                category: node.category
              })),
              links: dependencies
            }}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <SankeyNode
              fill={(node) => COLORS[node.category as keyof typeof COLORS] || '#ccc'}
              stroke="#000"
              width={150}
              nodePadding={10}
              label={({ name, icon }) => (
                <g>
                  <text x={-70} y={5} textAnchor="middle" fill="#000" fontSize={14} fontWeight={600}>
                    {icon} {name}
                  </text>
                </g>
              )}
              onNodeClick={(node) => setSelectedNode(node.name)}
            />
            <SankeyLink
              stroke="#999"
              strokeOpacity={0.6}
              strokeWidth={(link) => Math.sqrt(link.value)}
              onLinkClick={(link) => console.log('Link clicked:', link)}
            />
          </Sankey>
        </ResponsiveContainer>
      </div>

      {selectedNode && (
        <div className="card" style={{ 
          padding: '16px', 
          borderRadius: '12px', 
          border: '1px solid var(--line)',
          backgroundColor: 'white',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <h3 style={{ marginBottom: '12px' }}>技能详情</h3>
          <p>技能名称: <strong>{selectedNode}</strong></p>
          <p>依赖关系: {dependencies.filter(d => d.source === selectedNode).length} 个输出依赖</p>
          <p>被依赖关系: {dependencies.filter(d => d.target === selectedNode).length} 个输入依赖</p>
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
