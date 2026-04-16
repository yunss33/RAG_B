'use client';
import React from 'react';

interface ExecutionHistoryItem {
  id: string;
  timestamp: number;
  status: 'success' | 'error';
  nodes: {
    id: string;
    status: 'idle' | 'running' | 'success' | 'error';
    result?: any;
    error?: string;
  }[];
}

interface ExecutionHistoryProps {
  history: ExecutionHistoryItem[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'running':
      return '#FF9800';
    case 'success':
      return '#4CAF50';
    case 'error':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'running':
      return '🔄';
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    default:
      return '⏸';
  }
};

export default function ExecutionHistory({ history }: ExecutionHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="execution-history">
        <h3>执行历史</h3>
        <div className="empty-state">
          <p>暂无执行历史</p>
        </div>
      </div>
    );
  }

  return (
    <div className="execution-history">
      <h3>执行历史</h3>
      <div className="history-list">
        {history.map((item) => (
          <div 
            key={item.id} 
            className="history-item"
            style={{
              borderLeftColor: getStatusColor(item.status)
            }}
          >
            <div className="history-header">
              <div className="history-time">
                {new Date(item.timestamp).toLocaleString()}
              </div>
              <div 
                className="history-status"
                style={{
                  background: getStatusColor(item.status),
                  color: 'white'
                }}
              >
                {getStatusIcon(item.status)} {item.status === 'success' ? '成功' : '失败'}
              </div>
            </div>
            <div className="history-nodes">
              {item.nodes.map((node) => (
                <div key={node.id} className="history-node">
                  <span 
                    className="node-status"
                    style={{
                      background: getStatusColor(node.status),
                      color: 'white'
                    }}
                  >
                    {getStatusIcon(node.status)}
                  </span>
                  <span className="node-id">节点 {node.id}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
