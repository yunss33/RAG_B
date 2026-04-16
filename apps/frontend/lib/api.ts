const API_BASE =
  process.env.INTERNAL_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8100";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function getProjects() {
  const response = await fetch(`${API_BASE}/projects`, { cache: "no-store" });
  return parseJson<any[]>(response);
}

export async function getProjectStatus(id: string) {
  const response = await fetch(`${API_BASE}/projects/${id}/status`, { cache: "no-store" });
  return parseJson<any>(response);
}

export async function getRequirements(id: string) {
  const response = await fetch(`${API_BASE}/projects/${id}/requirements`, { cache: "no-store" });
  return parseJson<any[]>(response);
}

export async function getOutline(id: string) {
  const response = await fetch(`${API_BASE}/projects/${id}/outline`, { cache: "no-store" });
  return parseJson<any[]>(response);
}

export async function getDrafts(id: string) {
  const response = await fetch(`${API_BASE}/projects/${id}/drafts`, { cache: "no-store" });
  return parseJson<any>(response);
}

export async function getImageSuggestions(id: string) {
  const response = await fetch(`${API_BASE}/projects/${id}/image-suggestions`, { cache: "no-store" });
  return parseJson<any[]>(response);
}

export async function getFinalHtml(id: string) {
  const response = await fetch(`${API_BASE}/projects/${id}/final-html`, { cache: "no-store" });
  return parseJson<any>(response);
}

// 工作流管理 API
export async function getWorkflows() {
  const response = await fetch(`${API_BASE}/workflows`, { cache: "no-store" });
  return parseJson<any>(response);
}

export async function createWorkflow(data: { name: string; description?: string }) {
  const response = await fetch(`${API_BASE}/workflows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseJson<any>(response);
}

export async function getWorkflow(id: string) {
  const response = await fetch(`${API_BASE}/workflows/${id}`, { cache: "no-store" });
  return parseJson<any>(response);
}

export async function updateWorkflow(id: string, data: any) {
  const response = await fetch(`${API_BASE}/workflows/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseJson<any>(response);
}

export async function deleteWorkflow(id: string) {
  const response = await fetch(`${API_BASE}/workflows/${id}`, {
    method: "DELETE",
  });
  return parseJson<any>(response);
}

export async function runWorkflow(id: string) {
  const response = await fetch(`${API_BASE}/workflows/${id}/run`, {
    method: "POST",
  });
  return parseJson<any>(response);
}

// 记忆管理 API
export async function getMemories() {
  const response = await fetch(`${API_BASE}/memories`, { cache: "no-store" });
  return parseJson<any>(response);
}

export async function createMemory(data: { name: string; type: string; content: string; access?: string[] }) {
  const response = await fetch(`${API_BASE}/memories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseJson<any>(response);
}

export async function getMemory(id: string) {
  const response = await fetch(`${API_BASE}/memories/${id}`, { cache: "no-store" });
  return parseJson<any>(response);
}

export async function deleteMemory(id: string) {
  const response = await fetch(`${API_BASE}/memories/${id}`, {
    method: "DELETE",
  });
  return parseJson<any>(response);
}

export { API_BASE };
