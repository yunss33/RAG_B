'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface MessagePanelProps {
  projectId: string;
}

export function MessagePanel({ projectId }: MessagePanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        sender: 'parser',
        receiver: 'planner',
        content: '已完成招标文件解析，提取了10个关键需求点',
        timestamp: new Date().toISOString(),
        type: 'info'
      },
      {
        id: '2',
        sender: 'planner',
        receiver: 'writer',
        content: '基于解析结果，生成了15个章节的规划',
        timestamp: new Date(Date.now() + 1000).toISOString(),
        type: 'info'
      },
      {
        id: '3',
        sender: 'writer',
        receiver: 'reviewer',
        content: '完成了第一章的撰写，共1200字',
        timestamp: new Date(Date.now() + 2000).toISOString(),
        type: 'success'
      },
      {
        id: '4',
        sender: 'reviewer',
        receiver: 'writer',
        content: '第一章需要补充更多具体案例',
        timestamp: new Date(Date.now() + 3000).toISOString(),
        type: 'warning'
      },
      {
        id: '5',
        sender: 'writer',
        receiver: 'reviewer',
        content: '已根据反馈修改了第一章内容',
        timestamp: new Date(Date.now() + 4000).toISOString(),
        type: 'info'
      }
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < mockMessages.length) {
        setMessages(prev => [...prev, mockMessages[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (time: string) => {
    try {
      const date = new Date(time);
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return time;
    }
  };

  const getAgentName = (role: string) => {
    const agentNames: Record<string, string> = {
      parser: '招标文件解析专家',
      planner: '章节规划师',
      writer: '内容撰写专家',
      reviewer: '质量审查员',
      assembler: '成稿装配师'
    };
    return agentNames[role] || role;
  };

  const getMessageTypeStyles = (type: Message['type']) => {
    const styles: Record<string, React.CSSProperties> = {
      info: { backgroundColor: 'var(--accent-light)', borderColor: '#bfdbfe', color: '#1d4ed8' },
      warning: { backgroundColor: '#fefce8', borderColor: '#facc15', color: '#854d0e' },
      error: { backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b' },
      success: { backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#166534' }
    };
    return styles[type];
  };

  return (
    <div className="panel">
      <h2>实时消息</h2>
      <div style={{ 
        backgroundColor: 'var(--panel-alt)', 
        borderRadius: 'var(--border-radius)', 
        padding: '16px', 
        height: 'calc(100vh - 200px)', 
        overflowY: 'auto'
      }}>
        <div style={{ display: 'grid', gap: '16px' }}>
          {messages.length > 0 ? (
            messages.map((message) => (
              <div 
                key={message.id} 
                style={{
                  padding: '12px',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid',
                  ...getMessageTypeStyles(message.type)
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600 }}>{getAgentName(message.sender)}</span>
                    <span style={{ color: 'var(--muted)' }}>→</span>
                    <span style={{ fontWeight: 500 }}>{getAgentName(message.receiver)}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{formatTime(message.timestamp)}</span>
                </div>
                <div style={{ fontSize: '14px' }}>{message.content}</div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 0' }}>
              暂无消息
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
