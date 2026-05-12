import { FastifyInstance } from 'fastify';
import { database } from '../services/database.js';
import { processManager } from '../services/process-manager.js';

export async function projectsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request) => {
    const projects = database.getAllProjects();
    
    return {
      success: true,
      data: projects.map(p => ({
        ...p,
        status: processManager.isRunning(p.id) ? 'running' : p.status,
        pid: processManager.getPid(p.id) || p.pid,
      })),
    };
  });

  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const project = database.getProject(request.params.id);
    
    if (!project) {
      reply.code(404);
      return { success: false, error: 'Project not found' };
    }

    return {
      success: true,
      data: {
        ...project,
        status: processManager.isRunning(project.id) ? 'running' : project.status,
        pid: processManager.getPid(project.id) || project.pid,
      },
    };
  });

  fastify.post('/', async (request: any) => {
    const project = database.createProject(request.body);
    
    database.logOperation({
      type: 'project',
      action: 'create',
      target: project.id,
      targetType: 'project',
      status: 'success',
      message: `Project "${project.name}" created`,
    });

    return { success: true, data: project };
  });

  fastify.put<{ Params: { id: string } }>('/:id', async (request: any, reply) => {
    const project = database.updateProject(request.params.id, request.body);
    
    if (!project) {
      reply.code(404);
      return { success: false, error: 'Project not found' };
    }

    database.logOperation({
      type: 'project',
      action: 'update',
      target: project.id,
      targetType: 'project',
      status: 'success',
      message: `Project "${project.name}" updated`,
    });

    return { success: true, data: project };
  });

  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const project = database.getProject(request.params.id);
    
    if (!project) {
      reply.code(404);
      return { success: false, error: 'Project not found' };
    }

    if (processManager.isRunning(request.params.id)) {
      reply.code(400);
      return { success: false, error: 'Cannot delete a running project' };
    }

    database.deleteProject(request.params.id);

    database.logOperation({
      type: 'project',
      action: 'delete',
      target: project.id,
      targetType: 'project',
      status: 'success',
      message: `Project "${project.name}" deleted`,
    });

    return { success: true };
  });

  fastify.post<{ Params: { id: string } }>('/:id/start', async (request, reply) => {
    const project = database.getProject(request.params.id);
    
    if (!project) {
      reply.code(404);
      return { success: false, error: 'Project not found' };
    }

    if (processManager.isRunning(request.params.id)) {
      reply.code(400);
      return { success: false, error: 'Project is already running' };
    }

    const result = await processManager.start(request.params.id, project);
    
    if (result.success) {
      database.updateProjectStatus(request.params.id, 'running', result.pid);
      
      database.logOperation({
        type: 'project',
        action: 'start',
        target: project.id,
        targetType: 'project',
        status: 'success',
        message: `Project "${project.name}" started (PID: ${result.pid})`,
      });
    } else {
      database.updateProjectStatus(request.params.id, 'error');
      
      database.logOperation({
        type: 'project',
        action: 'start',
        target: project.id,
        targetType: 'project',
        status: 'failed',
        message: `Failed to start project "${project.name}": ${result.error}`,
      });
    }

    return { success: result.success, pid: result.pid, error: result.error };
  });

  fastify.post<{ Params: { id: string } }>('/:id/stop', async (request, reply) => {
    const project = database.getProject(request.params.id);
    
    if (!project) {
      reply.code(404);
      return { success: false, error: 'Project not found' };
    }

    const result = await processManager.stop(request.params.id);
    
    if (result.success) {
      database.updateProjectStatus(request.params.id, 'stopped');
      
      database.logOperation({
        type: 'project',
        action: 'stop',
        target: project.id,
        targetType: 'project',
        status: 'success',
        message: `Project "${project.name}" stopped`,
      });
    } else {
      database.logOperation({
        type: 'project',
        action: 'stop',
        target: project.id,
        targetType: 'project',
        status: 'failed',
        message: `Failed to stop project "${project.name}": ${result.error}`,
      });
    }

    return { success: result.success, error: result.error };
  });

  fastify.post<{ Params: { id: string } }>('/:id/restart', async (request, reply) => {
    const project = database.getProject(request.params.id);
    
    if (!project) {
      reply.code(404);
      return { success: false, error: 'Project not found' };
    }

    const result = await processManager.restart(request.params.id, project);
    
    if (result.success) {
      database.updateProjectStatus(request.params.id, 'running', result.pid);
      
      database.logOperation({
        type: 'project',
        action: 'restart',
        target: project.id,
        targetType: 'project',
        status: 'success',
        message: `Project "${project.name}" restarted (PID: ${result.pid})`,
      });
    } else {
      database.updateProjectStatus(request.params.id, 'error');
      
      database.logOperation({
        type: 'project',
        action: 'restart',
        target: project.id,
        targetType: 'project',
        status: 'failed',
        message: `Failed to restart project "${project.name}": ${result.error}`,
      });
    }

    return { success: result.success, pid: result.pid, error: result.error };
  });

  fastify.get<{ Params: { id: string }; Querystring: { tail?: string } }>('/:id/logs', async (request, reply) => {
    const project = database.getProject(request.params.id);
    
    if (!project) {
      reply.code(404);
      return { success: false, error: 'Project not found' };
    }

    const tail = parseInt(request.query.tail || '100', 10);
    const logs = processManager.getLogs(request.params.id, tail);

    return { success: true, data: logs };
  });
}
