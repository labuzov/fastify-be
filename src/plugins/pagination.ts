import { FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyRequest {
    getPagination(): {
      skip: number;
      take: number;
      page: number;
      limit: number;
    };
  }
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_PAGE = 10000;
const MAX_LIMIT = 100;

export default fp(async (fastify) => {
  fastify.decorateRequest('getPagination', function(this: FastifyRequest) {
    const query = this.query as { page?: string; limit?: string };

    const rawPage = parseInt(query.page || '');
    const rawLimit = parseInt(query.limit || '');

    const page = !isNaN(rawPage) && rawPage > 0 ? Math.min(rawPage, MAX_PAGE) : DEFAULT_PAGE;
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;

    return {
      skip: (page - 1) * limit,
      take: limit,
      page,
      limit,
    };
  });
});