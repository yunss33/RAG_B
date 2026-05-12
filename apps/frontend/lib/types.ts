export interface Project {
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

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'exited' | 'paused' | 'created';
  state: string;
  ports: PortMapping[];
  created: string;
  labels: Record<string, string>;
}

export interface PortMapping {
  privatePort: number;
  publicPort?: number;
  type: 'tcp' | 'udp';
}

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: number;
  created: string;
}

export interface DockerComposeService {
  name: string;
  project: string;
  status: 'running' | 'stopped';
  replicas: number;
  ports: PortMapping[];
}

export interface OperationLog {
  id: string;
  timestamp: string;
  type: 'project' | 'docker' | 'system';
  action: 'create' | 'update' | 'delete' | 'start' | 'stop' | 'restart';
  target: string;
  targetType: string;
  status: 'success' | 'failed';
  message?: string;
  metadata?: Record<string, any>;
}

export interface SystemStats {
  totalProjects: number;
  runningProjects: number;
  totalContainers: number;
  runningContainers: number;
  totalImages: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
