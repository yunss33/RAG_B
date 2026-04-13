"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api";

export function UploadForm({ projectId }: { projectId: string }) {
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setMessage("上传中...");
    const response = await fetch(`${API_BASE}/projects/${projectId}/files`, {
      method: "POST",
      body: formData
    });
    if (!response.ok) {
      setMessage(await response.text());
      return;
    }
    const data = await response.json();
    setMessage(`已上传：${data.file_name}`);
  }

  return (
    <form action={handleSubmit} className="card">
      <h3>上传资料</h3>
      <label>
        文件类型
        <select name="file_type" defaultValue="tender">
          <option value="tender">招标文件</option>
          <option value="knowledge">企业知识资料</option>
          <option value="case">历史案例</option>
          <option value="image">图片素材</option>
          <option value="other">其他</option>
        </select>
      </label>
      <label>
        选择文件
        <input type="file" name="file" required />
      </label>
      <button type="submit">上传</button>
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}

