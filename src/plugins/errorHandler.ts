import fp from 'fastify-plugin';
import { AppError } from '@/common/errors/appErrors.js';
import { ERROR_CODE } from '@/common/errors/errorCodes.js';

export default fp(async (app) => {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        code: error.code,
      });
    }

    // if (error.validation) {
    //   return reply.status(400).send({ 
    //     error: ERROR_CODE.VALIDATION_ERROR,
    //     details: error.validation
    //   });
    // }

    app.log.error(error);
    reply.status(500).send({
      code: ERROR_CODE.INTERNAL_ERROR,
    });
  });
});