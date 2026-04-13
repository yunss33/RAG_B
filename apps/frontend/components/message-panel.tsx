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

  // 模拟实时消息获取
  useEffect(() => {
    // 这里应该是从后端获取实时消息的逻辑
    // 暂时使用模拟数据
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

    // 模拟消息流
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

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 格式化时间
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

  // 获取智能体名称
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

  // 获取消息类型样式
  const getMessageTypeStyles = (type: Message['type']) => {
    const styles = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      success: 'bg-green-50 border-green-200 text-green-800'
    };
    return styles[type];
  };

  return (
    <div className="panel">
      <h2>实时消息</h2>
      <div className="bg-gray-50 rounded-lg p-4 h-[calc(100vh-200px)] overflow-y-auto">
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`p-3 rounded-lg border ${getMessageTypeStyles(message.type)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{getAgentName(message.sender)}</span>
                    <span className="text-gray-500">→</span>
                    <span className="font-medium">{getAgentName(message.receiver)}</span>
                  </div>
                  <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                </div>
                <div className="text-sm">{message.content}</div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              暂无消息
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
