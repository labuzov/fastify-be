import { FastifySchema } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';

export const authRegisterBodySchema = {
  type: 'object',
  required: ['login', 'password'],
  properties: {
    login: { type: 'string', minLength: 6 },
    password: { type: 'string', minLength: 6 },
  },
  additionalProperties: false,
} as const;

export const authRegisterSchema: FastifySchema = {
  body: authRegisterBodySchema,
};

export type AuthRegisterBody = FromSchema<typeof authRegisterBodySchema>;


export const authLoginBodySchema = {
  type: 'object',
  required: ['login', 'password'],
  properties: {
    login: { type: 'string' },
    password: { type: 'string' },
    rememberMe: { type: 'boolean' },
  },
  additionalProperties: false,
} as const;

export const authLoginSchema: FastifySchema = {
  body: authLoginBodySchema,
};

export type AuthLoginBody = FromSchema<typeof authLoginBodySchema>;