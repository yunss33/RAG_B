// API服务配置
const API_BASE_URL = 'http://localhost:8103';

// 项目类型定义
export interface Project {
  id: string;
  name: string;
  description: string;
  outline: OutlineSection[];
  outline_confirmed: boolean;
  config: {
    enable_image_insertion: boolean;
    enable_rag: boolean;
  };
}

export interface OutlineSection {
  id: string;
  title: string;
  content?: string;
  confirmed: boolean;
  status?: string;
}

// API响应类型
export interface ApiResponse<T> {
  status: string;
  message?: string;
  result?: T;
  error?: string;
}

// 健康检查
export async function healthCheck(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/healthz`);
    const data = await response.json();
    return { status: response.ok ? 'success' : 'error', result: data };
  } catch (error) {
    return { status: 'error', error: (error as Error).message };
  }
}

// 获取技能列表
export async function getSkills(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/internal/skills`);
    const data = await response.json();
    return { status: response.ok ? 'success' : 'error', result: data };
  } catch (error) {
    return { status: 'error', error: (error as Error).message };
  }
}

// 生成项目大纲
export async function generateOutline(project: Project): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/internal/plan-outline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ project }),
    });
    const data = await response.json();
    return { status: response.ok ? 'success' : 'error', result: data };
  } catch (error) {
    return { status: 'error', error: (error as Error).message };
  }
}

// 生成项目内容
export async function generateContent(project: Project): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/internal/write-drafts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ project }),
    });
    const data = await response.json();
    return { status: response.ok ? 'success' : 'error', result: data };
  } catch (error) {
    return { status: 'error', error: (error as Error).message };
  }
}

// 确认大纲
export async function confirmOutline(project: Project): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/internal/outline/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ project }),
    });
    const data = await response.json();
    return { status: response.ok ? 'success' : 'error', result: data };
  } catch (error) {
    return { status: 'error', error: (error as Error).message };
  }
}

// 处理问题回答
export async function answerQuestions(project: Project, answers: any[]): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/internal/answer-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ project, answers }),
    });
    const data = await response.json();
    return { status: response.ok ? 'success' : 'error', result: data };
  } catch (error) {
    return { status: 'error', error: (error as Error).message };
  }
}