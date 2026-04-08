import { permissionConditionsMetadata, visiblePermissions } from '@/common/permissions/types.js';

export class PermissionsService {
  constructor() {}

  getPermissions() {
    const result = visiblePermissions.map(key => {
      const conditions = permissionConditionsMetadata[key as keyof typeof permissionConditionsMetadata] || null;

      return {
        key,
        conditions,
      };
    });

    return result;
  }
}