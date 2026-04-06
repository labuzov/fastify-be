export enum PERMISSION {
  ALL = 'all',

  ROLES_MANAGE = 'roles:manage',

  USERS_CREATE = 'users:create',
};

export const hiddenPermissions: PERMISSION[] = [PERMISSION.ALL];


export enum CONDITIONS {
  ALLOWED_ROLE_IDS = 'allowedRoleIds',
};

export const PermissionConditionsMetadata = {
  [PERMISSION.USERS_CREATE]: [CONDITIONS.ALLOWED_ROLE_IDS],
} as const;

export type PermissionConditionsSchema = {
  [CONDITIONS.ALLOWED_ROLE_IDS]: string[];
  // [CONDITIONS.ONLY_OWN]: boolean;
};

export type PermissionConditions = {
  [P in keyof typeof PermissionConditionsMetadata]?: {
    [K in (typeof PermissionConditionsMetadata)[P][number]]?: PermissionConditionsSchema[K];
  }
};