import axios from 'axios';
import type { Project, DockerContainer, DockerImage, SystemStats, ApiResponse, OperationLog, DockerComposeService } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  projects: {
    list: async (): Promise<Project[]> => {
      const response = await client.get<ApiResponse<Project[]>>('/projects');
      return response.data.data || [];
    },
    
    get: async (id: string): Promise<Project> => {
      const response = await client.get<ApiResponse<Project>>(`/projects/${id}`);
      return response.data.data!;
    },
    
    create: async (data: Partial<Project>): Promise<Project> => {
      const response = await client.post<ApiResponse<Project>>('/projects', data);
      return response.data.data!;
    },
    
    update: async (id: string, data: Partial<Project>): Promise<Project> => {
      const response = await client.put<ApiResponse<Project>>(`/projects/${id}`, data);
      return response.data.data!;
    },
    
    delete: async (id: string): Promise<void> => {
      await client.delete(`/projects/${id}`);
    },
    
    start: async (id: string): Promise<{ success: boolean; pid?: number }> => {
      const response = await client.post<ApiResponse<{ success: boolean; pid?: number }>>(`/projects/${id}/start`);
      return response.data.data || { success: false };
    },
    
    stop: async (id: string): Promise<{ success: boolean }> => {
      const response = await client.post<ApiResponse<{ success: boolean }>>(`/projects/${id}/stop`);
      return response.data.data || { success: false };
    },
    
    restart: async (id: string): Promise<{ success: boolean; pid?: number }> => {
      const response = await client.post<ApiResponse<{ success: boolean; pid?: number }>>(`/projects/${id}/restart`);
      return response.data.data || { success: false };
    },
    
    logs: async (id: string, tail = 100): Promise<string> => {
      const response = await client.get<ApiResponse<string>>(`/projects/${id}/logs`, {
        params: { tail },
      });
      return response.data.data || '';
    },
  },
  
  docker: {
    containers: {
      list: async (): Promise<DockerContainer[]> => {
        const response = await client.get<ApiResponse<DockerContainer[]>>('/docker/containers');
        return response.data.data || [];
      },
      
      start: async (id: string): Promise<{ success: boolean }> => {
        const response = await client.post<ApiResponse<{ success: boolean }>>(`/docker/containers/${id}/start`);
        return response.data.data || { success: false };
      },
      
      stop: async (id: string): Promise<{ success: boolean }> => {
        const response = await client.post<ApiResponse<{ success: boolean }>>(`/docker/containers/${id}/stop`);
        return response.data.data || { success: false };
      },
      
      restart: async (id: string): Promise<{ success: boolean }> => {
        const response = await client.post<ApiResponse<{ success: boolean }>>(`/docker/containers/${id}/restart`);
        return response.data.data || { success: false };
      },
      
      remove: async (id: string): Promise<{ success: boolean }> => {
        const response = await client.delete<ApiResponse<{ success: boolean }>>(`/docker/containers/${id}`);
        return response.data.data || { success: false };
      },
      
      logs: async (id: string, tail = 100): Promise<string> => {
        const response = await client.get<ApiResponse<string>>(`/docker/containers/${id}/logs`, {
          params: { tail },
        });
        return response.data.data || '';
      },
    },
    
    images: {
      list: async (): Promise<DockerImage[]> => {
        const response = await client.get<ApiResponse<DockerImage[]>>('/docker/images');
        return response.data.data || [];
      },
      
      pull: async (repo: string, tag: string): Promise<{ success: boolean }> => {
        const response = await client.post<ApiResponse<{ success: boolean }>>('/docker/images/pull', { repo, tag });
        return response.data.data || { success: false };
      },
      
      remove: async (id: string): Promise<{ success: boolean }> => {
        const response = await client.delete<ApiResponse<{ success: boolean }>>(`/docker/images/${id}`);
        return response.data.data || { success: false };
      },
    },
    
    compose: {
      files: async (): Promise<string[]> => {
        const response = await client.get<ApiResponse<string[]>>('/docker/compose/files');
        return response.data.data || [];
      },
      
      up: async (file: string, detached = true): Promise<{ success: boolean }> => {
        const response = await client.post<ApiResponse<{ success: boolean }>>('/docker/compose/up', { file, detached });
        return response.data.data || { success: false };
      },
      
      down: async (file: string): Promise<{ success: boolean }> => {
        const response = await client.post<ApiResponse<{ success: boolean }>>('/docker/compose/down', { file });
        return response.data.data || { success: false };
      },
      
      ps: async (file?: string): Promise<DockerComposeService[]> => {
        const response = await client.get<ApiResponse<DockerComposeService[]>>('/docker/compose/ps', {
          params: { file },
        });
        return response.data.data || [];
      },
      
      logs: async (file: string, service?: string): Promise<string> => {
        const response = await client.get<ApiResponse<string>>('/docker/compose/logs', {
          params: { file, service },
        });
        return response.data.data || '';
      },
    },
  },
  
  system: {
    stats: async (): Promise<SystemStats> => {
      const response = await client.get<ApiResponse<SystemStats>>('/system/stats');
      return response.data.data || {
        totalProjects: 0,
        runningProjects: 0,
        totalContainers: 0,
        runningContainers: 0,
        totalImages: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
      };
    },
    
    health: async (): Promise<{ status: string }> => {
      const response = await client.get<ApiResponse<{ status: string }>>('/system/health');
      return response.data.data || { status: 'unknown' };
    },
  },
  
  logs: {
    list: async (): Promise<OperationLog[]> => {
      const response = await client.get<ApiResponse<OperationLog[]>>('/logs');
      return response.data.data || [];
    },
  },
};

export default api;
