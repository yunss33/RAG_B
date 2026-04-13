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

export async function getProject(id: string) {
  const response = await fetch(`${API_BASE}/projects/${id}`, { cache: "no-store" });
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

// 技能相关API
export async function getSkills() {
  const response = await fetch(`${API_BASE}/internal/skills`, { cache: "no-store" });
  return parseJson<any[]>(response);
}

export async function getSkillRecommendations(projectId: string) {
  const response = await fetch(`${API_BASE}/internal/skills/recommend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ project: { id: projectId } }),
    cache: "no-store"
  });
  return parseJson<any[]>(response);
}

export async function executeSkill(skillName: string, projectId: string, context?: any) {
  const response = await fetch(`${API_BASE}/internal/skills/execute/${skillName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ project: { id: projectId }, context }),
    cache: "no-store"
  });
  return parseJson<any>(response);
}

export { API_BASE };
