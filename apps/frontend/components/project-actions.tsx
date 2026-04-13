"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api";

export function ProjectActions({ projectId }: { projectId: string }) {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function doAction(path: string) {
    setMessage("处理中...");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/projects/${projectId}${path}`, { method: "POST" });
      if (!response.ok) {
        setMessage(await response.text());
        return;
      }
      const data = await response.json();
      setMessage(`完成: ${JSON.stringify(data)}`);
    } catch (error) {
      setMessage(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button 
        onClick={() => doAction("/ingest")}
        disabled={isLoading}
        style={{
          padding: '10px 16px',
          borderRadius: '12px',
          border: '1px solid var(--accent)',
          backgroundColor: 'var(--accent)',
          color: 'white',
          fontWeight: 600,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: isLoading ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {isLoading ? '处理中...' : '资料入库'}
      </button>
      <button 
        className="secondary"
        onClick={() => doAction("/run")}
        disabled={isLoading}
        style={{
          padding: '10px 16px',
          borderRadius: '12px',
          border: '1px solid var(--line)',
          backgroundColor: 'transparent',
          color: 'var(--ink)',
          fontWeight: 600,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: isLoading ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            e.currentTarget.style.backgroundColor = 'var(--accent-light)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        {isLoading ? '处理中...' : '启动主流程'}
      </button>
      {message && (
        <span className="muted mt-2" style={{
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: message.includes('错误') ? '#fef2f2' : 'var(--panel-alt)',
          color: message.includes('错误') ? '#991b1b' : 'var(--muted)',
          fontSize: '14px',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          {message}
        </span>
      )}
    </div>
  );
}

