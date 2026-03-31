import { FastifyInstance, FastifyRequest } from 'fastify';
import { VERIFICATION_TYPE } from '@/common/verification/types.js';
import { ChangePasswordBody, changePasswordSchema, VerifyEmailBody, verifyEmailSchema } from './profile.schema.js';
import { ProfileService } from './profile.service.js';

export default async function(app: FastifyInstance) {
  const profileService = new ProfileService(app.prisma);

  app.patch('/password',
    { schema: changePasswordSchema, preHandler: [app.isAuth] }, async (request: FastifyRequest<{ Body: ChangePasswordBody }>, reply) => {
    const { id } = request.user as { id: string };
    const refreshToken = request.cookies.refreshToken;

    await profileService.changePassword(id, request.body, refreshToken);

    reply.send();
  });

  app.post('/verify/email/confirm',
    { schema: verifyEmailSchema, preHandler: [app.isAuth] }, async (request: FastifyRequest<{ Body: VerifyEmailBody }>, reply) => {
    const { id } = request.user as { id: string };

    const verified = await app.verification.validateAndUse(
      id, request.body.code, VERIFICATION_TYPE.EMAIL_VERIFICATION
    );

    if (verified) await profileService.verifyEmail(id);

    reply.send();
  });

  app.post('/verify/email/request',
    { preHandler: [app.isAuth] }, async (request, reply) => {
    const { id } = request.user as { id: string };

    const code = await app.verification.createCode(
      id, VERIFICATION_TYPE.EMAIL_VERIFICATION
    );

    reply.send({ code });
  });

  app.get('/me', { preHandler: [app.isAuth] }, async (request, reply) => {
    const { id, roleId } = request.user as { id: string, roleId: string };

    const [user, permissions] = await Promise.all([
      profileService.getUserInfo(id),
      app.permissions.getRolePermissions(roleId)
    ]);

    reply.send({ ...user, permissions });
  });
}