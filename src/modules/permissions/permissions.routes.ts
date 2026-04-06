import { FastifyInstance } from 'fastify';
import { PERMISSION } from '@/common/permissions/types.js';
import { PermissionsService } from './permissions.service.js';

export default async function(app: FastifyInstance) {
  const permissionsService = new PermissionsService();

  app.get('/',
    { preHandler: [app.isAuth, app.hasAnyPermission([PERMISSION.ROLES_MANAGE])] }, async (_, reply) => {
    const permissions = permissionsService.getPermissions();

    reply.send(permissions);
  });
}