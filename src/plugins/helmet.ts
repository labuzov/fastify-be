import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';

export default fp(async (app) => {
  await app.register(helmet, { 
    global: true,
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
  });
});