import fp from 'fastify-plugin';
import { AppError } from '@/common/errors.js';

export default fp(async (app) => {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        message: error.message,
        code: error.code,
      });
    }

    // // 1. Ошибки валидации (Fastify/Ajv)
    // if (error.validation) {
    //   return reply.status(400).send({
    //     errors: error.validation.map((err) => ({
    //       path: err.instancePath || err.params.missingProperty,
    //       message: err.message,
    //       code: 'VALIDATION_ERROR',
    //     })),
    //   });
    // }

    app.log.error(error);
    reply.status(500).send({
      message: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
    });
  });
});