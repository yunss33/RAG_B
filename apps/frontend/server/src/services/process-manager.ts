import { ChildProcess, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ProcessInfo {
  pid: number;
  process: ChildProcess;
  logs: string[];
}

const runningProcesses: Map<string, ProcessInfo> = new Map();

export const processManager = {
  start(id: string, project: any): Promise<{ success: boolean; pid?: number; error?: string }> {
    return new Promise((resolve) => {
      if (runningProcesses.has(id)) {
        resolve({ success: false, error: 'Project is already running' });
        return;
      }

      const { workingDirectory, command, entryPoint, environment, type } = project;
      
      let cmd: string;
      let args: string[];

      if (type === 'node' || type === 'python') {
        cmd = type === 'node' ? 'node' : 'python';
        args = entryPoint ? [entryPoint] : [];
      } else {
        const parts = (command || '').split(' ');
        cmd = parts[0];
        args = parts.slice(1);
      }

      const options = {
        cwd: workingDirectory,
        env: { ...process.env, ...environment },
        stdio: ['pipe', 'pipe', 'pipe'] as const,
      };

      try {
        const child = spawn(cmd, args, options);
        const logs: string[] = [];

        child.stdout?.on('data', (data: Buffer) => {
          const line = data.toString();
          logs.push(`[${new Date().toISOString()}] ${line}`);
          if (logs.length > 1000) logs.shift();
        });

        child.stderr?.on('data', (data: Buffer) => {
          const line = data.toString();
          logs.push(`[${new Date().toISOString()}] ERROR: ${line}`);
          if (logs.length > 1000) logs.shift();
        });

        child.on('error', (error) => {
          console.error(`Process ${id} error:`, error);
          logs.push(`[${new Date().toISOString()}] ERROR: ${error.message}`);
          runningProcesses.delete(id);
        });

        child.on('exit', (code) => {
          console.log(`Process ${id} exited with code ${code}`);
          logs.push(`[${new Date().toISOString()}] Process exited with code ${code}`);
          runningProcesses.delete(id);
        });

        runningProcesses.set(id, {
          pid: child.pid!,
          process: child,
          logs,
        });

        resolve({ success: true, pid: child.pid });
      } catch (error: any) {
        resolve({ success: false, error: error.message });
      }
    });
  },

  stop(id: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const info = runningProcesses.get(id);
      
      if (!info) {
        resolve({ success: false, error: 'Project is not running' });
        return;
      }

      try {
        process.kill(info.pid, 'SIGTERM');
        
        setTimeout(() => {
          const currentInfo = runningProcesses.get(id);
          if (currentInfo && currentInfo.pid === info.pid) {
            try {
              process.kill(info.pid, 'SIGKILL');
            } catch (e) {
            }
            runningProcesses.delete(id);
          }
        }, 5000);

        resolve({ success: true });
      } catch (error: any) {
        runningProcesses.delete(id);
        resolve({ success: false, error: error.message });
      }
    });
  },

  restart(id: string, project: any): Promise<{ success: boolean; pid?: number; error?: string }> {
    return new Promise(async (resolve) => {
      await this.stop(id);
      
      setTimeout(async () => {
        const result = await this.start(id, project);
        resolve(result);
      }, 1000);
    });
  },

  getLogs(id: string, tail = 100): string {
    const info = runningProcesses.get(id);
    
    if (!info) {
      return 'Project is not running';
    }

    const logs = info.logs;
    return logs.slice(-tail).join('');
  },

  isRunning(id: string): boolean {
    return runningProcesses.has(id);
  },

  getPid(id: string): number | undefined {
    return runningProcesses.get(id)?.pid;
  },

  getAllRunning(): string[] {
    return Array.from(runningProcesses.keys());
  },
};
