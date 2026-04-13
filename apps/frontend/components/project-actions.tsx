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
    <div className="actions">
      <button 
        onClick={() => doAction("/ingest")}
        disabled={isLoading}
        style={{
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1
        }}
      >
        {isLoading ? '处理中...' : '资料入库'}
      </button>
      <button 
        className="secondary"
        onClick={() => doAction("/run")}
        disabled={isLoading}
        style={{
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1
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

