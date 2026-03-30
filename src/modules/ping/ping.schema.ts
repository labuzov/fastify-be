import { FastifySchema } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';

export const pingPostBodySchema = {
  type: 'object',
  properties: {
    test: { type: 'string', minLength: 2 },
  },
  required: ['test'],
  additionalProperties: false,
} as const;

export const pingPostResponseSchema = {
  200: {
    type: 'object',
    properties: {
      test: { type: 'string' }
    }
  },
};

export const pingPostSchema: FastifySchema = {
  body: pingPostBodySchema,
  response: pingPostResponseSchema,
};

export type PingPostBody = FromSchema<typeof pingPostBodySchema>;