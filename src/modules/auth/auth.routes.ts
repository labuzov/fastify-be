import { FastifyInstance, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service.js';
import { LoginBody, loginSchema, RegisterBody, registerSchema, sessionsGetSchema } from './auth.schema.js';

export default async function(app: FastifyInstance) {
  const authService = new AuthService(app.prisma, app.jwt);

  app.post('/register', { schema: registerSchema }, async (request: FastifyRequest<{ Body: RegisterBody }>, reply) => {
    const user = await authService.register(request.body);
    return reply.send(user);
  });

  app.post('/login', { schema: loginSchema }, async (request: FastifyRequest<{ Body: LoginBody }>, reply) => {
    const userAgent = request.headers['user-agent'];

    const { accessToken, refreshToken } = await authService.login(request.body, userAgent);

    reply
      .setCookie('refreshToken', refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })
      .send({ accessToken });
  });

  app.post('/refresh', async (request, reply) => {
    const token = request.cookies.refreshToken;
    const accessToken = await authService.refresh(token);

    reply.send({ accessToken });
  });

  app.post('/logout', async (request, reply) => {
    const token = request.cookies.refreshToken;

    await authService.logout(token);

    reply
      .clearCookie('refreshToken', { path: '/' })
      .send();
  });

  app.post('/logout-all', async (request, reply) => {
    const token = request.cookies.refreshToken;

    await authService.logoutFromAllDevices(token);

    reply.send();
  });

  app.get('/sessions', { schema: sessionsGetSchema, preHandler: [app.isAuth] }, async (request, reply) => {
    const { id } = request.user as { id: string };
    const token = request.cookies.refreshToken;

    const sessions = await authService.getSessions(id, token);

    reply.send(sessions);
  });

  app.delete('/sessions/:id', { preHandler: [app.isAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user as { id: string };

    await authService.deleteSession(id, user.id);

    reply.send();
  });

  app.get('/me', { preHandler: [app.isAuth] }, async (request, reply) => {
    const { id, roleId } = request.user as { id: string, roleId: string };

    const [user, permissions] = await Promise.all([
      authService.getUserInfo(id),
      app.permissions.getRolePermissions(roleId)
    ]);

    reply.send({ ...user, permissions });
  });
}