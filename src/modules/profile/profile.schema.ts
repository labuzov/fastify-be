import z from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { FastifySchema } from 'fastify';

const changePasswordBodyZodSchema = z.object({
  password: z.string(),
  newPassword: z.string().min(6).max(32)
});

export const changePasswordBodySchema = zodToJsonSchema(changePasswordBodyZodSchema);

export const changePasswordSchema: FastifySchema = {
  body: changePasswordBodySchema,
};


const verifyEmailBodyZodSchema = z.object({
  code: z.string().min(6).max(6)
});

export const verifyEmailBodySchema = zodToJsonSchema(verifyEmailBodyZodSchema);

export const verifyEmailSchema: FastifySchema = {
  body: verifyEmailBodySchema,
};


export type ChangePasswordBody = z.infer<typeof changePasswordBodyZodSchema>;
export type VerifyEmailBody = z.infer<typeof verifyEmailBodyZodSchema>;