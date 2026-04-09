import { Prisma, PrismaClient } from '@prisma/client';
import { CONDITIONS, PERMISSION, permissionConditionsMetadata, visiblePermissions } from '@/common/permissions/types.js';
import { BadRequestError, NotFoundError } from '@/common/errors/appErrors.js';
import { ERROR_CODE } from '@/common/errors/errorCodes.js';
import { CreateRoleBody, PermissionItem, UpdateRoleBody } from './roles.schema.js';

export class RolesService {
  constructor(private prisma: PrismaClient) {}

  async getRoles(params: { skip: number; take: number; search?: string }) {
    const { skip, take, search } = params;

    const where: Prisma.RoleWhereInput = {
      isHidden: false,
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.role.count({ where }),
      this.prisma.role.findMany({
        where,
        skip,
        take,
        include: {
          _count: { select: { users: true } }
        },
        orderBy: { name: 'asc' }
      })
    ]);

    return { total, items };
  }

  async getRoleById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: {
        id,
        isHidden: false,
      },
      include: {
        _count: { select: { users: true } }
      }
    });

    if (!role) {
      throw new NotFoundError();
    }

    return role;
  }

  async createRole(body: CreateRoleBody) {
    const { name, description, permissions } = body;

    this.validateRolePermissions(permissions);

    const newRole = await this.prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          name,
          description
        }
      });

      if (permissions.length) {
        await tx.rolePermission.createMany({
          data: permissions.map(p => ({
            roleId: role.id,
            permissionKey: p.key,
            conditions: p.conditions
          }))
        });
      }

      return role;
    });

    return newRole;
  }

  async updateRole(id: string, body: UpdateRoleBody) {
    const { name, description, permissions } = body;

    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundError();
    }

    if (role.isSystem) {
      throw new BadRequestError(ERROR_CODE.ROLES_CANNOT_MODIFY_SYSTEM_ROLE);
    }

    const updatedRole = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.role.update({
        where: { id },
        data: { name, description }
      });

      await tx.rolePermission.deleteMany({
        where: { roleId: id }
      });

      if (permissions.length) {
        await tx.rolePermission.createMany({
          data: permissions.map(p => ({
            roleId: id,
            permissionKey: p.key,
            conditions: p.conditions
          }))
        });
      }

      return updated;
    });

    return updatedRole;
  }

  async deleteRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    if (!role) {
      throw new NotFoundError();
    }

    if (role.isSystem) {
      throw new BadRequestError(ERROR_CODE.ROLES_CANNOT_DELETE_SYSTEM_ROLE);
    }

    if (role._count.users) {
      throw new BadRequestError(ERROR_CODE.ROLES_CANNOT_DELETE_WITH_USERS);
    }

    await this.prisma.role.delete({
      where: { id },
    });
  }

  private validateRolePermissions(incomingPermissions: PermissionItem[]) {
    if (!incomingPermissions.length) return;

    for (const incoming of incomingPermissions) {
      const permission = visiblePermissions.find(p => p === incoming.key);
      if (!permission) {
        throw new BadRequestError(ERROR_CODE.ROLES_INVALID_PERMISSIONS);
      }
      
      this.validateConditions(permission, incoming.conditions);
    }
  };

  private validateConditions(permissionKey: PERMISSION, conditions: PermissionItem['conditions']) {
    if (!conditions) return;

    const allowedKeys = permissionConditionsMetadata[permissionKey as keyof typeof permissionConditionsMetadata];
    const incomingKeys = Object.keys(conditions);

    if (!allowedKeys && !!incomingKeys.length) {
      throw new BadRequestError(ERROR_CODE.ROLES_INVALID_PERMISSIONS);
    }

    for (const key of incomingKeys) {
      if (!allowedKeys.includes(key as CONDITIONS)) {
        throw new BadRequestError(ERROR_CODE.ROLES_INVALID_PERMISSIONS);
      }
    }
  };
}