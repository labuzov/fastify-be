import { PrismaClient } from '@prisma/client';
import { rolePermissionsCache } from '@/common/cache.js';

export interface PermissionData {
  key: string;
  conditions: any | null;
}

export class PermissionService {
  constructor(private prisma: PrismaClient) {}

  async getRolePermissions(roleId: string): Promise<PermissionData[]> {
    const cached = rolePermissionsCache.get<PermissionData[]>(roleId);
    if (cached) return cached;
    
    const perms = await this.prisma.rolePermission.findMany({
      where: { roleId },
      select: { permissionKey: true, conditions: true }
    })

    const permissionData: PermissionData[] = perms.map(p => ({
      key: p.permissionKey,
      conditions: p.conditions
    }));

    rolePermissionsCache.set(roleId, permissionData);

    return permissionData;
  }

  invalidateCache(roleId: string) {
    rolePermissionsCache.del(roleId);
  }
}