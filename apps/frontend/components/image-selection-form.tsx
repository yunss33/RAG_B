"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api";

type Suggestion = {
  id: string;
  source_name: string;
  suggested_section_title: string;
  caption: string;
  preview_url?: string;
};

export function ImageSelectionForm({ projectId, suggestions }: { projectId: string; suggestions: Suggestion[] }) {
  const [message, setMessage] = useState("");

  async function submitSelections(formData: FormData) {
    const payload = suggestions.map((suggestion) => ({
      suggestion_id: suggestion.id,
      accepted: formData.get(`accept-${suggestion.id}`) === "on",
      placement: "section-body-after-first-paragraph",
      layout: "full-width"
    }));
    const response = await fetch(`${API_BASE}/projects/${projectId}/image-selections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      setMessage(await response.text());
      return;
    }
    setMessage("已提交选择并继续装配终稿。");
  }

  return (
    <form action={submitSelections} className="panel">
      <h2>图片选择</h2>
      <div className="list">
        {suggestions.map((suggestion) => (
          <div className="card" key={suggestion.id}>
            <strong>{suggestion.source_name}</strong>
            <p className="muted">建议章节：{suggestion.suggested_section_title}</p>
            <p>{suggestion.caption}</p>
            {suggestion.preview_url ? (
              <img src={suggestion.preview_url} alt={suggestion.caption} style={{ maxWidth: "100%", borderRadius: 12 }} />
            ) : null}
            <label>
              <input type="checkbox" name={`accept-${suggestion.id}`} style={{ width: "auto", marginRight: 8 }} />
              接受该图片建议
            </label>
          </div>
        ))}
      </div>
      <div className="actions">
        <button type="submit">确认并继续</button>
        {message ? <span className="muted">{message}</span> : null}
      </div>
    </form>
  );
}
