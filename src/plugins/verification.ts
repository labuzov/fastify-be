import fp from 'fastify-plugin';
import { VerificationService } from '@/common/verification/verification.service.js';

declare module 'fastify' {
  interface FastifyInstance {
    verification: VerificationService;
  }
}

export default fp(async (app) => {
  const service = new VerificationService(app.prisma);

  app.decorate('verification', service);
});