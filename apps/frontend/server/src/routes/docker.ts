import { FastifyInstance } from 'fastify';
import Docker from 'dockerode';
import { spawn } from 'child_process';
import { database } from '../services/database.js';

const docker = new Docker();

export async function dockerRoutes(fastify: FastifyInstance) {
  fastify.get('/containers', async (request) => {
    try {
      const containers = await docker.listContainers({ all: true });
      
      return {
        success: true,
        data: containers.map(c => ({
          id: c.Id,
          name: c.Names[0]?.replace(/^\//, '') || '',
          image: c.Image,
          status: c.State,
          state: c.Status,
          ports: c.Ports.map(p => ({
            privatePort: p.PrivatePort,
            publicPort: p.PublicPort,
            type: p.Type as 'tcp' | 'udp',
          })),
          created: new Date(c.Created * 1000).toISOString(),
          labels: c.Labels || {},
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  });

  fastify.post<{ Params: { id: string } }>('/containers/:id/start', async (request, reply) => {
    try {
      const container = docker.getContainer(request.params.id);
      await container.start();
      
      database.logOperation({
        type: 'docker',
        action: 'start',
        target: request.params.id,
        targetType: 'container',
        status: 'success',
        message: `Container started`,
      });

      return { success: true };
    } catch (error: any) {
      database.logOperation({
        type: 'docker',
        action: 'start',
        target: request.params.id,
        targetType: 'container',
        status: 'failed',
        message: `Failed to start container: ${error.message}`,
      });

      return { success: false, error: error.message };
    }
  });

  fastify.post<{ Params: { id: string } }>('/containers/:id/stop', async (request, reply) => {
    try {
      const container = docker.getContainer(request.params.id);
      await container.stop();
      
      database.logOperation({
        type: 'docker',
        action: 'stop',
        target: request.params.id,
        targetType: 'container',
        status: 'success',
        message: `Container stopped`,
      });

      return { success: true };
    } catch (error: any) {
      database.logOperation({
        type: 'docker',
        action: 'stop',
        target: request.params.id,
        targetType: 'container',
        status: 'failed',
        message: `Failed to stop container: ${error.message}`,
      });

      return { success: false, error: error.message };
    }
  });

  fastify.post<{ Params: { id: string } }>('/containers/:id/restart', async (request, reply) => {
    try {
      const container = docker.getContainer(request.params.id);
      await container.restart();
      
      database.logOperation({
        type: 'docker',
        action: 'restart',
        target: request.params.id,
        targetType: 'container',
        status: 'success',
        message: `Container restarted`,
      });

      return { success: true };
    } catch (error: any) {
      database.logOperation({
        type: 'docker',
        action: 'restart',
        target: request.params.id,
        targetType: 'container',
        status: 'failed',
        message: `Failed to restart container: ${error.message}`,
      });

      return { success: false, error: error.message };
    }
  });

  fastify.delete<{ Params: { id: string } }>('/containers/:id', async (request, reply) => {
    try {
      const container = docker.getContainer(request.params.id);
      await container.remove({ force: true });
      
      database.logOperation({
        type: 'docker',
        action: 'delete',
        target: request.params.id,
        targetType: 'container',
        status: 'success',
        message: `Container deleted`,
      });

      return { success: true };
    } catch (error: any) {
      database.logOperation({
        type: 'docker',
        action: 'delete',
        target: request.params.id,
        targetType: 'container',
        status: 'failed',
        message: `Failed to delete container: ${error.message}`,
      });

      return { success: false, error: error.message };
    }
  });

  fastify.get<{ Params: { id: string }; Querystring: { tail?: string } }>('/containers/:id/logs', async (request, reply) => {
    try {
      const container = docker.getContainer(request.params.id);
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail: parseInt(request.query.tail || '100', 10),
      });

      return {
        success: true,
        data: logs.toString(),
      };
    } catch (error: any) {
      return { success: false, error: error.message, data: '' };
    }
  });

  fastify.get('/images', async (request) => {
    try {
      const images = await docker.listImages();
      
      return {
        success: true,
        data: images.map(img => ({
          id: img.Id.replace('sha256:', '').substring(0, 12),
          repository: img.RepoTags?.[0]?.split(':')[0] || '<none>',
          tag: img.RepoTags?.[0]?.split(':')[1] || 'latest',
          size: img.Size,
          created: new Date(img.Created * 1000).toISOString(),
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  });

  fastify.post('/images/pull', async (request: any) => {
    try {
      const { repo, tag } = request.body;
      const imageName = `${repo}:${tag || 'latest'}`;

      await new Promise<void>((resolve, reject) => {
        docker.pull(imageName, (err: any, stream: any) => {
          if (err) {
            reject(err);
            return;
          }

          docker.modem.followProgress(stream, (err: any) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });

      database.logOperation({
        type: 'docker',
        action: 'create',
        target: imageName,
        targetType: 'image',
        status: 'success',
        message: `Image pulled: ${imageName}`,
      });

      return { success: true };
    } catch (error: any) {
      database.logOperation({
        type: 'docker',
        action: 'create',
        target: request.body.repo,
        targetType: 'image',
        status: 'failed',
        message: `Failed to pull image: ${error.message}`,
      });

      return { success: false, error: error.message };
    }
  });

  fastify.delete<{ Params: { id: string } }>('/images/:id', async (request, reply) => {
    try {
      const image = docker.getImage(request.params.id);
      await image.remove({ force: true });
      
      database.logOperation({
        type: 'docker',
        action: 'delete',
        target: request.params.id,
        targetType: 'image',
        status: 'success',
        message: `Image deleted`,
      });

      return { success: true };
    } catch (error: any) {
      database.logOperation({
        type: 'docker',
        action: 'delete',
        target: request.params.id,
        targetType: 'image',
        status: 'failed',
        message: `Failed to delete image: ${error.message}`,
      });

      return { success: false, error: error.message };
    }
  });

  fastify.get('/compose/files', async (request) => {
    try {
      const configDir = process.env.COMPOSE_FILES_DIR || path.join(process.cwd(), 'compose');
      const files = fs.readdirSync(configDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
      return { success: true, data: files };
    } catch (error: any) {
      return { success: true, data: [] };
    }
  });

  fastify.post('/compose/up', async (request: any) => {
    try {
      const { file, detached = true } = request.body;
      const args = ['-f', file, 'up', '-d'];
      
      await execCommand('docker-compose', args);

      database.logOperation({
        type: 'docker',
        action: 'start',
        target: file,
        targetType: 'compose',
        status: 'success',
        message: `Compose stack started: ${file}`,
      });

      return { success: true };
    } catch (error: any) {
      database.logOperation({
        type: 'docker',
        action: 'start',
        target: request.body.file,
        targetType: 'compose',
        status: 'failed',
        message: `Failed to start compose stack: ${error.message}`,
      });

      return { success: false, error: error.message };
    }
  });

  fastify.post('/compose/down', async (request: any) => {
    try {
      const { file } = request.body;
      const args = ['-f', file, 'down'];
      
      await execCommand('docker-compose', args);

      database.logOperation({
        type: 'docker',
        action: 'stop',
        target: file,
        targetType: 'compose',
        status: 'success',
        message: `Compose stack stopped: ${file}`,
      });

      return { success: true };
    } catch (error: any) {
      database.logOperation({
        type: 'docker',
        action: 'stop',
        target: request.body.file,
        targetType: 'compose',
        status: 'failed',
        message: `Failed to stop compose stack: ${error.message}`,
      });

      return { success: false, error: error.message };
    }
  });

  fastify.get<{ Querystring: { file?: string } }>('/compose/ps', async (request) => {
    try {
      const file = request.query.file;
      if (!file) {
        return { success: true, data: [] };
      }

      const output = await execCommand('docker-compose', ['-f', file, 'ps', '--format', 'json']);
      const services = JSON.parse(output || '[]');

      return {
        success: true,
        data: services.map((s: any) => ({
          name: s.Service,
          project: s.Project,
          status: s.State,
          replicas: 1,
          ports: [],
        })),
      };
    } catch (error: any) {
      return { success: true, data: [] };
    }
  });

  fastify.get<{ Querystring: { file?: string; service?: string } }>('/compose/logs', async (request) => {
    try {
      const { file, service } = request.query;
      if (!file) {
        return { success: true, data: '' };
      }

      const args = ['-f', file, 'logs'];
      if (service) {
        args.push(service);
      }
      args.push('--tail=100');

      const output = await execCommand('docker-compose', args);
      return { success: true, data: output };
    } catch (error: any) {
      return { success: false, error: error.message, data: '' };
    }
  });
}

function execCommand(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { shell: true });
    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `Command exited with code ${code}`));
      }
    });

    proc.on('error', (error) => {
      reject(error);
    });
  });
}

import fs from 'fs';
import path from 'path';
