import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export default fp(async (app) => {
  const pool = new pg.Pool({ 
    connectionString: app.config.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'production' ?
      ['error'] :
      ['query', 'info', 'warn', 'error'],
  });

  try {
    await prisma.$connect();
    app.log.info('Prisma connected successfully');
  } catch (err) {
    app.log.error('Prisma connection error: ' + err);
    process.exit(1);
  }

  app.decorate('prisma', prisma);

  app.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect();
    await pool.end();
  });
});