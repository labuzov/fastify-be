import { z } from 'zod';

export enum PERMISSION {
  ALL = 'all',

  ROLES_READ = 'roles:read',
  ROLES_MANAGE = 'roles:manage',

  USERS_CREATE = 'users:create',
};

export const hiddenPermissions: PERMISSION[] = [PERMISSION.ALL];
export const visiblePermissions = Object.values(PERMISSION).filter(perm => !hiddenPermissions.includes(perm));


export enum CONDITIONS {
  ALLOWED_ROLE_IDS = 'allowedRoleIds',
};

export const conditionValidators = {
  [CONDITIONS.ALLOWED_ROLE_IDS]: z.array(z.string().uuid()),
} as const;

export type PermissionConditionsSchema = {
  [K in keyof typeof conditionValidators]?: z.infer<(typeof conditionValidators)[K]>;
};

export const permissionConditionsMetadata = {
  [PERMISSION.USERS_CREATE]: [CONDITIONS.ALLOWED_ROLE_IDS],
} as const;

export type PermissionConditions = {
  [P in keyof typeof permissionConditionsMetadata]?: {
    [K in (typeof permissionConditionsMetadata)[P][number]]?: PermissionConditionsSchema[K];
  }
};