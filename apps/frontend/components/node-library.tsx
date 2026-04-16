'use client';
import { useCallback } from 'react';

interface NodeLibraryProps {
  onAddNode: (type: string, position: { x: number; y: number }) => void;
}

export default function NodeLibrary({ onAddNode }: NodeLibraryProps) {
  const nodeTypes = [
    {
      type: 'general',
      name: '通用智能体',
      description: '通用目的智能体',
      icon: '🔄',
      color: '#4CAF50',
    },
    {
      type: 'analyzer',
      name: '分析智能体',
      description: '分析数据和文档',
      icon: '📊',
      color: '#2196F3',
    },
    {
      type: 'planner',
      name: '规划智能体',
      description: '制定计划和策略',
      icon: '📋',
      color: '#FF9800',
    },
    {
      type: 'writer',
      name: '写作智能体',
      description: '生成文本内容',
      icon: '✍️',
      color: '#9C27B0',
    },
    {
      type: 'reviewer',
      name: '审查智能体',
      description: '审查和验证内容',
      icon: '🔍',
      color: '#F44336',
    },
    {
      type: 'coordinator',
      name: '协调智能体',
      description: '协调其他智能体',
      icon: '🤝',
      color: '#607D8B',
    },
  ];

  const handleDragStart = useCallback((e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('text/plain', type);
  }, []);

  return (
    <div className="node-library">
      <h3>智能体库</h3>
      <div className="node-categories">
        <div className="category">
          <h4>智能体类型</h4>
          <div className="node-list">
            {nodeTypes.map((nodeType) => (
              <div
                key={nodeType.type}
                className="node-item"
                draggable
                onDragStart={(e) => handleDragStart(e, nodeType.type)}
                style={{ borderLeftColor: nodeType.color }}
              >
                <div className="node-icon" style={{ backgroundColor: nodeType.color }}>
                  {nodeType.icon}
                </div>
                <div className="node-info">
                  <div className="node-name">{nodeType.name}</div>
                  <div className="node-description">{nodeType.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
