"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { API_BASE } from "@/lib/api";

export function CreateProjectForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    const payload = {
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      target_language: String(formData.get("target_language") || "zh-CN")
    };
    const response = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      setError(await response.text());
      return;
    }
    const data = await response.json();
    router.push(`/projects/${data.project_id}`);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="panel">
      <h2>创建项目</h2>
      <label>
        项目名称
        <input name="name" required placeholder="例如：某智慧园区建设项目标书" />
      </label>
      <label>
        项目描述
        <textarea name="description" rows={4} placeholder="输入本项目的范围、目标和交付要求" />
      </label>
      <label>
        目标语言
        <select name="target_language" defaultValue="zh-CN">
          <option value="zh-CN">中文</option>
          <option value="en-US">英文</option>
          <option value="bilingual">双语</option>
        </select>
      </label>
      <button type="submit">创建并进入项目</button>
      {error ? <p className="muted">{error}</p> : null}
    </form>
  );
}

