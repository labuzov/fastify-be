import { z } from 'zod';

export const paginationQueryZodSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const paginationMetaZodSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const withPaginationZodSchema = <T extends z.ZodTypeAny>(itemSchema: T) => {
  return z.object({
    items: z.array(itemSchema),
    meta: paginationMetaZodSchema,
  });
};

export type PaginationMeta = z.infer<typeof paginationMetaZodSchema>;

export type PaginatedData<T> = {
  items: T[];
  meta: PaginationMeta;
};
