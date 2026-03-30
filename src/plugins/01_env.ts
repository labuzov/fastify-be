import fp from 'fastify-plugin';
import fastifyEnv from '@fastify/env';

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      DATABASE_URL: string;
      JWT_SECRET: string;
      PORT: number;
    };
  }
}

const schema = {
  type: 'object',
  required: ['DATABASE_URL', 'JWT_SECRET'],
  properties: {
    DATABASE_URL: { type: 'string' },
    JWT_SECRET: { type: 'string' },
    PORT: { type: 'number', default: 3000 }
  }
};

export default fp(async (app) => {
  await app.register(fastifyEnv, {
    confKey: 'config',
    schema,
    dotenv: true,
  });
});
