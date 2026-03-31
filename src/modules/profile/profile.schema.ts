import { FastifySchema } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';

export const changePasswordBodySchema = {
  type: 'object',
  required: ['password', 'newPassword'],
  properties: {
    password: { type: 'string' },
    newPassword: { type: 'string', minLength: 6, maxLength: 32 },
  },
  additionalProperties: false,
} as const;

export type ChangePasswordBody = FromSchema<typeof changePasswordBodySchema>;

export const changePasswordSchema: FastifySchema = {
  body: changePasswordBodySchema,
};


export const verifyEmailBodySchema = {
  type: 'object',
  required: ['code'],
  properties: {
    code: { type: 'string', minLength: 6, maxLength: 6 },
  },
  additionalProperties: false,
} as const;

export type VerifyEmailBody = FromSchema<typeof verifyEmailBodySchema>;

export const verifyEmailSchema: FastifySchema = {
  body: verifyEmailBodySchema,
};