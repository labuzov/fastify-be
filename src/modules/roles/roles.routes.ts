import { FastifyInstance, FastifyRequest } from 'fastify';
import { PERMISSION } from '@/common/permissions/types.js';
import { RolesService } from './roles.service.js';
import { CreateRoleBody, createRoleSchema, DeleteRoleParams, deleteRoleSchema, GetRoleParams, getRoleSchema, UpdateRoleBody, UpdateRoleParams, updateRoleSchema } from './roles.schema.js';

export default async function(app: FastifyInstance) {
  const rolesService = new RolesService(app.prisma);

  app.get('/',
    { preHandler: [app.isAuth, app.hasAnyPermission([PERMISSION.ROLES_READ, PERMISSION.ROLES_MANAGE])] },
    async (_, reply) => {
      const roles = await rolesService.getRoles();

      reply.send(roles);
    }
  );

  app.get('/:id',
    {
      schema: getRoleSchema,
      preHandler: [app.isAuth, app.hasAnyPermission([PERMISSION.ROLES_READ, PERMISSION.ROLES_MANAGE])]
    },
    async (request: FastifyRequest<{ Params: GetRoleParams }>, reply) => {
      const { id } = request.params;

      const [role, permissions] = await Promise.all([
        rolesService.getRoleById(id),
        app.permissions.getRolePermissions(id)
      ]);

      reply.send({ ...role, permissions });
    }
  );

  app.post('/',
    { schema: createRoleSchema, preHandler: [app.isAuth, app.hasAnyPermission([PERMISSION.ROLES_MANAGE])] },
    async (request: FastifyRequest<{ Body: CreateRoleBody }>, reply) => {
      const newRole = await rolesService.createRole(request.body);

      reply.send(newRole);
    }
  );

  app.patch('/:id',
    { schema: updateRoleSchema, preHandler: [app.isAuth, app.hasAnyPermission([PERMISSION.ROLES_MANAGE])] },
    async (request: FastifyRequest<{ Params: UpdateRoleParams, Body: UpdateRoleBody }>, reply) => {
      const updatedRole = await rolesService.updateRole(request.params.id, request.body);

      app.permissions.invalidateCache(updatedRole.id);

      reply.send(updatedRole);
    }
  );

  app.delete('/:id',
    { schema: deleteRoleSchema, preHandler: [app.isAuth, app.hasAnyPermission([PERMISSION.ROLES_MANAGE])] },
    async (request: FastifyRequest<{ Params: DeleteRoleParams }>, reply) => {
      await rolesService.deleteRole(request.params.id);

      app.permissions.invalidateCache(request.params.id);

      reply.send();
    }
  );
}