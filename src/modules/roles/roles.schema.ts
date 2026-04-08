import { FastifySchema } from 'fastify';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { conditionValidators } from '@/common/permissions/types.js';

const conditionsSchema = z.object(conditionValidators).partial().strict().optional();

const permissionItemZodSchema = z.object({
  key: z.string(),
  conditions: conditionsSchema,
});

const createRoleBodyZodSchema = z.object({
  name: z.string().min(3),
  description: z.string().max(100).optional(),
  permissions: z.array(permissionItemZodSchema)
});

export const createRoleSchema: FastifySchema = {
  body: zodToJsonSchema(createRoleBodyZodSchema),
};


const updateRoleParamsZodSchema = z.object({
  id: z.string().uuid(),
});

const updateRoleBodyZodSchema = z.object({
  name: z.string().min(3),
  description: z.string().max(100).optional(),
  permissions: z.array(permissionItemZodSchema)
});

export const updateRoleSchema: FastifySchema = {
  params: zodToJsonSchema(updateRoleParamsZodSchema),
  body: zodToJsonSchema(updateRoleBodyZodSchema),
};


const deleteRoleParamsZodSchema = z.object({
  id: z.string().uuid(),
});

export const deleteRoleSchema: FastifySchema = {
  params: zodToJsonSchema(deleteRoleParamsZodSchema),
};


const getRoleParamsZodSchema = z.object({
  id: z.string().uuid(),
});

export const getRoleSchema: FastifySchema = {
  params: zodToJsonSchema(getRoleParamsZodSchema),
};


export type PermissionItem = z.infer<typeof permissionItemZodSchema>;
export type CreateRoleBody = z.infer<typeof createRoleBodyZodSchema>;
export type UpdateRoleParams = z.infer<typeof updateRoleParamsZodSchema>;
export type UpdateRoleBody = z.infer<typeof updateRoleBodyZodSchema>;
export type DeleteRoleParams = z.infer<typeof deleteRoleParamsZodSchema>;
export type GetRoleParams = z.infer<typeof getRoleParamsZodSchema>;