import { FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import { ForbiddenError, UnauthorizedError } from '@/common/errors/appErrors.js';
import { PermissionService } from '@/common/permissions/permissions.service.js';
import { PERMISSION } from '@/common/permissions/types.js';

declare module 'fastify' {
  interface FastifyInstance {
    permissions: PermissionService;
    isAuth: any;
    hasAnyPermission: (permissions: PERMISSION[]) => any;
  }
}

export default fp(async (app) => {
  const permissionService = new PermissionService(app.prisma);

  app.register(cookie, {
    secret: app.config.JWT_SECRET,
    parseOptions: {}
  });

  app.register(jwt, {
    secret: app.config.JWT_SECRET,
    cookie: {
      cookieName: 'refreshToken',
      signed: true,
    },
  });

  app.decorate('permissions', permissionService);

  app.decorate('isAuth', async (request: FastifyRequest) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      throw new UnauthorizedError();
    }
  });

  app.decorate('hasAnyPermission', (permissions: PERMISSION[]) => {
    return async (request: FastifyRequest) => {
      const user = request.user as { roleId: string };
      if (!user) throw new UnauthorizedError();

      const userPermissions = await app.permissions.getRolePermissions(user.roleId);
      const userPermissionsSet = new Set(userPermissions.map(p => p.key));

      const hasPermission = permissions.some(p => userPermissionsSet.has(p)) || userPermissionsSet.has(PERMISSION.ALL);
      if (!hasPermission) throw new ForbiddenError();
    };
  });
});