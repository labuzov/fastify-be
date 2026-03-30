import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { JWT } from '@fastify/jwt';
import { AppError, NotFoundError, UnauthorizedError } from '@/common/errors.js';
import { AuthLoginBody, AuthRegisterBody } from './auth.schema.js';

export class AuthService {
  constructor(private prisma: PrismaClient, private jwt: JWT) {}

  async register(body: AuthRegisterBody) {
    const candidate = await this.prisma.user.findUnique({ where: { login: body.login } });
    if (candidate) throw new AppError(409, 'Login is used');

    const hashedPassword = await bcrypt.hash(body.password, 10);

    return this.prisma.user.create({
      data: { ...body, password: hashedPassword, roleId: '29d60f72-f8f8-46fc-b0f5-fdcde47fe871' },
      select: { id: true, login: true }
    });
  }

  async login(body: AuthLoginBody, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { login: body.login },
    });

    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw new UnauthorizedError();
    }

    const accessToken = this.generateAccessToken(user.id, user.roleId);
    const refreshToken = this.generateRefreshToken(user.id, user.roleId);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        userAgent,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    return { accessToken, refreshToken };
  }

  async refresh(token?: string) {
    if (!token) {
      throw new UnauthorizedError();
    }

    const savedToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!savedToken || savedToken.expiresAt < new Date()) {
      throw new UnauthorizedError();
    }

    return this.generateAccessToken(savedToken.user.id, savedToken.user.roleId);
  }

  async logout(token?: string) {
    if (!token) {
      throw new UnauthorizedError();
    }

    await this.prisma.refreshToken.delete({ where: { token } }).catch(() => {
      // ignore
    });
  }

  async logoutFromAllDevices(currentToken: string) {
    const session = await this.prisma.refreshToken.findUnique({
      where: { token: currentToken },
      select: { userId: true }
    });

    if (!session) {
      throw new UnauthorizedError();
    }

    await this.prisma.refreshToken.deleteMany({
      where: {
        userId: session.userId,
        token: { not: currentToken }
      }
    });
  }

  async getUserInfo(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        login: true,
        name: true,
        roleId: true,
      },
    });

    if (!user) {
      throw new NotFoundError();
    }

    return user;
  }

  private generateAccessToken(id: string, roleId: string) {
    return this.jwt.sign({ id, roleId }, { expiresIn: '15m' });
  }

  private generateRefreshToken(id: string, roleId: string) {
    return this.jwt.sign({ id, roleId }, { expiresIn: '30d' });
  }
}