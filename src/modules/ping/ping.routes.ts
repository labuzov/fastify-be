import { FastifyInstance, FastifyRequest } from 'fastify';
import { PingPostBody, pingPostSchema } from './ping.schema.js';

export function pingRoutes(app: FastifyInstance) {
  app.get('/', async (_, reply) => {
    return reply.send();
  });

  app.post(
    '/',
    {
      schema: pingPostSchema,
      preHandler: [app.isAuth]
    },
    async (request: FastifyRequest<{ Body: PingPostBody }>, reply) => {
      return reply.send(request.body);
    }
  );
}