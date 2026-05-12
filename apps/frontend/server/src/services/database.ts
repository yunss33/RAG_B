import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'projects.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

interface Project {
  id: string;
  name: string;
  description?: string;
  type: 'node' | 'python' | 'docker' | 'custom';
  status: 'stopped' | 'running' | 'error' | 'starting';
  workingDirectory: string;
  entryPoint?: string;
  command?: string;
  arguments?: string[];
  environment: Record<string, string>;
  healthCheck?: {
    enabled: boolean;
    endpoint?: string;
    interval: number;
    timeout: number;
  };
  createdAt: string;
  updatedAt: string;
  lastStartedAt?: string;
  pid?: number;
}

interface OperationLog {
  id: string;
  timestamp: string;
  type: string;
  action: string;
  target: string;
  targetType: string;
  status: string;
  message?: string;
  metadata?: any;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readProjects(): Project[] {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeProjects(projects: Project[]) {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(projects, null, 2));
}

function readLogs(): OperationLog[] {
  ensureDataDir();
  if (!fs.existsSync(LOGS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(LOGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeLogs(logs: OperationLog[]) {
  ensureDataDir();
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
}

export const database = {
  createProject(data: Partial<Project>): Project {
    const projects = readProjects();
    const now = new Date().toISOString();
    
    const project: Project = {
      id: uuidv4(),
      name: data.name || 'Unnamed Project',
      description: data.description,
      type: data.type || 'custom',
      status: 'stopped',
      workingDirectory: data.workingDirectory || process.cwd(),
      entryPoint: data.entryPoint,
      command: data.command,
      arguments: data.arguments || [],
      environment: data.environment || {},
      healthCheck: data.healthCheck,
      createdAt: now,
      updatedAt: now,
    };

    projects.push(project);
    writeProjects(projects);
    return project;
  },

  getProject(id: string): Project | null {
    const projects = readProjects();
    return projects.find(p => p.id === id) || null;
  },

  getAllProjects(): Project[] {
    return readProjects();
  },

  updateProject(id: string, data: Partial<Project>): Project | null {
    const projects = readProjects();
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) return null;

    const now = new Date().toISOString();
    projects[index] = {
      ...projects[index],
      ...data,
      updatedAt: now,
    };

    writeProjects(projects);
    return projects[index];
  },

  updateProjectStatus(id: string, status: string, pid?: number): Project | null {
    const projects = readProjects();
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) return null;

    const now = new Date().toISOString();
    projects[index].status = status as any;
    projects[index].pid = pid;
    projects[index].lastStartedAt = status === 'running' ? now : projects[index].lastStartedAt;
    projects[index].updatedAt = now;

    writeProjects(projects);
    return projects[index];
  },

  deleteProject(id: string): boolean {
    const projects = readProjects();
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) return false;

    projects.splice(index, 1);
    writeProjects(projects);
    return true;
  },

  logOperation(data: {
    type: string;
    action: string;
    target: string;
    targetType: string;
    status: string;
    message?: string;
    metadata?: any;
  }) {
    const logs = readLogs();
    const log: OperationLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...data,
    };

    logs.unshift(log);
    if (logs.length > 1000) {
      logs.splice(1000);
    }

    writeLogs(logs);
  },

  getLogs(limit = 100): OperationLog[] {
    const logs = readLogs();
    return logs.slice(0, limit);
  },
};
