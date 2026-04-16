'use client';
import React from 'react';
import { Handle, Position } from 'reactflow';

interface CustomNodeData {
  name: string;
  description: string;
  capabilities: string[];
  type: string;
}

interface CustomNodeProps {
  data: CustomNodeData;
}

const getAgentTypeColor = (type: string) => {
  const colors = {
    general: '#4CAF50',
    analyzer: '#2196F3',
    planner: '#FF9800',
    writer: '#9C27B0',
    reviewer: '#F44336',
    coordinator: '#607D8B',
  };
  return colors[type as keyof typeof colors] || '#9E9E9E';
};

export default function CustomNode({ data }: CustomNodeProps) {
  const color = getAgentTypeColor(data.type);

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: color }} />
      <div
        style={{
          background: '#fffaf4',
          border: `2px solid ${color}`,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(84, 51, 23, 0.1)',
          minWidth: 180,
          maxWidth: 220,
        }}
      >
        <div
          style={{
            background: color,
            color: 'white',
            padding: '8px 12px',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14 }}>{data.name}</span>
          <span style={{ fontSize: 12, opacity: 0.8 }}>{data.type}</span>
        </div>
        <div style={{ padding: 12 }}>
          <p style={{ margin: 0, marginBottom: 8, fontSize: 12, color: '#6a5f52' }}>
            {data.description}
          </p>
          {data.capabilities && data.capabilities.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {data.capabilities.map((capability, index) => (
                <span
                  key={index}
                  style={{
                    fontSize: 10,
                    padding: '2px 6px',
                    background: '#fff1e0',
                    borderRadius: 999,
                    color: '#6a5f52',
                  }}
                >
                  {capability}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: color }} />
    </>
  );
}
