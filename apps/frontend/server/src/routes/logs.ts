import { FastifyInstance } from 'fastify';
import { database } from '../services/database.js';

export async function logsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request: any) => {
    const limit = parseInt(request.query.limit || '100', 10);
    const logs = database.getLogs(limit);

    return {
      success: true,
      data: logs,
    };
  });
}
