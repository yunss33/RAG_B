import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { projectsRoutes } from './routes/projects.js';
import { dockerRoutes } from './routes/docker.js';
import { systemRoutes } from './routes/system.js';
import { logsRoutes } from './routes/logs.js';
import { database } from './services/database.js';

export const fastify = Fastify({
  logger: true,
});

async function start() {
  try {
    await fastify.register(cors, {
      origin: true,
      credentials: true,
    });

    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
    });

    await fastify.register(projectsRoutes, { prefix: '/api/projects' });
    await fastify.register(dockerRoutes, { prefix: '/api/docker' });
    await fastify.register(systemRoutes, { prefix: '/api/system' });
    await fastify.register(logsRoutes, { prefix: '/api/logs' });

    fastify.get('/api/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server is running on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
