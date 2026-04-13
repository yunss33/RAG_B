"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api";

export function ProjectActions({ projectId }: { projectId: string }) {
  const [message, setMessage] = useState<string>("");

  async function doAction(path: string) {
    setMessage("处理中...");
    const response = await fetch(`${API_BASE}/projects/${projectId}${path}`, { method: "POST" });
    if (!response.ok) {
      setMessage(await response.text());
      return;
    }
    const data = await response.json();
    setMessage(`完成: ${JSON.stringify(data)}`);
  }

  return (
    <div className="actions">
      <button onClick={() => doAction("/ingest")}>资料入库</button>
      <button className="secondary" onClick={() => doAction("/run")}>启动主流程</button>
      {message ? <span className="muted">{message}</span> : null}
    </div>
  );
}

