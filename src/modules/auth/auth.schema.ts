import z from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { FastifySchema } from 'fastify';

const registerBodyZodSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(32)
});

export const registerBodySchema = zodToJsonSchema(registerBodyZodSchema);

export const registerSchema: FastifySchema = {
  body: registerBodySchema,
};


const loginBodyZodSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const loginBodySchema = zodToJsonSchema(loginBodyZodSchema);

export const loginSchema: FastifySchema = {
  body: loginBodySchema,
};


const sessionZodSchema = z.object({
  id: z.string(),
  userAgent: z.string().nullable(),
  createdAt: z.string().datetime().or(z.date()), 
  isCurrent: z.boolean(),
});

export const sessionsGetResponseSchema = {
  200: z.array(sessionZodSchema),
} as const;


export const sessionsGetSchema: FastifySchema = {
  response: sessionsGetResponseSchema,
};


export type RegisterBody = z.infer<typeof registerBodyZodSchema>;
export type LoginBody = z.infer<typeof loginBodyZodSchema>;
export type Session = z.infer<typeof sessionZodSchema>;
