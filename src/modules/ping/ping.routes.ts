import { FastifyInstance } from 'fastify';

export function pingRoutes(app: FastifyInstance) {
  app.get('/', async (_, reply) => {
    return reply.send();
  });
}