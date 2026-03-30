import NodeCache from 'node-cache';

export const rolePermissionsCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });