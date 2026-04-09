import { PaginatedData } from '@/common/schemas/pagination.schema.js';

export function toPaginatedData<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedData<T> {
  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}