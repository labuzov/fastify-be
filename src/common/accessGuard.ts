import { PERMISSION, PermissionConditions } from './permissions/types.js';

export class AccessGuard {
  static canCreateUserWithRole(
    conditions: PermissionConditions[PERMISSION.USERS_CREATE] | null,
    targetRoleId: string
  ): boolean {
    if (!conditions || !conditions.allowedRoleIds) return true;

    return conditions.allowedRoleIds.includes(targetRoleId);
  }
}
