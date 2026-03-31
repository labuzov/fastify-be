import { FastifySchema } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';

export const registerBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', minLength: 6 },
    password: { type: 'string', minLength: 6 },
  },
  additionalProperties: false,
} as const;

export type RegisterBody = FromSchema<typeof registerBodySchema>;

export const registerSchema: FastifySchema = {
  body: registerBodySchema,
};


export const loginBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string' },
    password: { type: 'string' },
  },
  additionalProperties: false,
} as const;

export type LoginBody = FromSchema<typeof loginBodySchema>;

export const loginSchema: FastifySchema = {
  body: loginBodySchema,
};


export const sessionsGetResponseSchema = {
  200: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userAgent: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        isCurrent: { type: 'boolean' }
      }
    }
  },
} as const;

export type SessionsGetResponse = FromSchema<typeof sessionsGetResponseSchema[200]>;

export const sessionsGetSchema: FastifySchema = {
  response: sessionsGetResponseSchema,
};
