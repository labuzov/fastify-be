import { FastifyInstance, FastifyRequest } from 'fastify';
import { PingPostBody, pingPostSchema } from './ping.schema.js';
import { Permission } from '@/common/permissions.js';

export function pingRoutes(app: FastifyInstance) {
  app.get('/', async (_, reply) => {
    return reply.send();
  });

  app.post(
    '/',
    {
      schema: pingPostSchema,
      preHandler: [app.isAuth, app.hasAnyPermission([Permission.PING_POST])]
    },
    async (request: FastifyRequest<{ Body: PingPostBody }>, reply) => {
      return reply.send(request.body);
    }
  );
}