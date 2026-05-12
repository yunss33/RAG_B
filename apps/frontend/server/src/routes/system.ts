import { FastifyInstance } from 'fastify';
import Docker from 'dockerode';
import os from 'os';
import { database } from '../services/database.js';
import { processManager } from '../services/process-manager.js';

const docker = new Docker();

export async function systemRoutes(fastify: FastifyInstance) {
  fastify.get('/stats', async (request) => {
    try {
      const projects = database.getAllProjects();
      const containers = await docker.listContainers({ all: true });
      const images = await docker.listImages();

      const cpuUsage = os.loadavg()[0] / os.cpus().length * 100;
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

      return {
        success: true,
        data: {
          totalProjects: projects.length,
          runningProjects: projects.filter(p => processManager.isRunning(p.id)).length,
          totalContainers: containers.length,
          runningContainers: containers.filter(c => c.State === 'running').length,
          totalImages: images.length,
          cpuUsage: Math.min(100, cpuUsage),
          memoryUsage: Math.min(100, memoryUsage),
          diskUsage: 0,
        },
      };
    } catch (error: any) {
      return {
        success: true,
        data: {
          totalProjects: 0,
          runningProjects: 0,
          totalContainers: 0,
          runningContainers: 0,
          totalImages: 0,
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
        },
      };
    }
  });

  fastify.get('/info', async (request) => {
    return {
      success: true,
      data: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        uptime: os.uptime(),
      },
    };
  });

  fastify.get('/health', async (request) => {
    try {
      await docker.ping();
      return { success: true, data: { status: 'healthy', docker: 'connected' } };
    } catch (error) {
      return { success: true, data: { status: 'healthy', docker: 'disconnected' } };
    }
  });
}
