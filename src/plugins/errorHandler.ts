import { FastifyError } from 'fastify';
import fp from 'fastify-plugin';
import { AppError } from '@/common/errors/appErrors.js';
import { ERROR_CODE } from '@/common/errors/errorCodes.js';

function hasStatusCode(error: unknown): error is { statusCode: number } {
  return !!error && typeof error === 'object' && 'statusCode' in error;
}

function isFastifyError(error: unknown): error is FastifyError {
  return !!error && typeof error === 'object' && 'code' in error;
}

export default fp(async (app) => {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        code: error.code,
      });
    }

    if (hasStatusCode(error)) {
      if (error.statusCode === 429) {
        reply.status(429).send({
          code: ERROR_CODE.TOO_MANY_REQUESTS,
        });
      }
    }

    if (isFastifyError(error) && error.validation) {
      return reply.status(error.statusCode || 400).send({ 
        code: ERROR_CODE.VALIDATION_ERROR,
        details: error.validation
      });
    }

    app.log.error(error);
    reply.status(500).send({
      code: ERROR_CODE.INTERNAL_ERROR,
    });
  });
});