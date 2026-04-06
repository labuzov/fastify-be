import { hiddenPermissions, PERMISSION, PermissionConditionsMetadata } from '@/common/permissions/types.js';

export class PermissionsService {
  constructor() {}

  getPermissions() {
    const visiblePerms = this.getVisiblePermissions();

    const result = visiblePerms.map(key => {
      const conditions = PermissionConditionsMetadata[key as keyof typeof PermissionConditionsMetadata] || null;

      return {
        key,
        conditions,
      };
    });

    return result;
  }

  private getVisiblePermissions() {
    const hiddenPerms = new Set(hiddenPermissions);
    return Object.values(PERMISSION).filter(perm => !hiddenPerms.has(perm));
  }
}