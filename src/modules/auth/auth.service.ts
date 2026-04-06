import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { JWT } from '@fastify/jwt';
import { AppError, BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '@/common/errors/appErrors.js';
import { ERROR_CODE } from '@/common/errors/errorCodes.js';
import { getNormalizedUserAgent } from '@/common/utils/ua-parser.js';
import { LoginBody, RegisterBody, SessionsGetResponse } from './auth.schema.js';

export class AuthService {
  constructor(private prisma: PrismaClient, private jwt: JWT) {}

  async register(body: RegisterBody) {
    const defaultRole = await this.prisma.role.findFirst({
      where: { isDefault: true }
    });

    if (!defaultRole) throw new AppError();

    const candidate = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (candidate) throw new ConflictError(ERROR_CODE.AUTH_EMAIL_ALREADY_EXISTS);

    const hashedPassword = await bcrypt.hash(body.password, 10);

    await this.prisma.user.create({
      data: { ...body, password: hashedPassword, roleId: defaultRole.id }
    });
  }

  async login(body: LoginBody, rawUserAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw new BadRequestError(ERROR_CODE.AUTH_INVALID_CREDENTIALS);
    }

    const expirationDays = 30;
    const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

    const accessToken = this.generateAccessToken(user.id, user.roleId);
    const refreshToken = this.generateRefreshToken(user.id, user.roleId, expirationDays);

    const userAgent = getNormalizedUserAgent(rawUserAgent);

    const updated = await this.prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        userAgent,
      },
      data: {
        token: refreshToken,
        expiresAt,
        createdAt: new Date(),
      },
    });

    if (!updated.count) {
      await this.prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          userAgent,
          expiresAt
        }
      });
    }

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

  async logoutFromAllDevices(currentToken?: string) {
    if (!currentToken) {
      throw new UnauthorizedError();
    }

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

  async getSessions(userId: string, currentToken?: string) {
    if (!userId || !currentToken) {
      throw new UnauthorizedError();
    }

    const sessions = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() }
      },
      select: {
        id: true,
        token: true,
        userAgent: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const result: SessionsGetResponse = sessions.map(session => ({
      id: session.id,
      userAgent: session.userAgent,
      createdAt: session.createdAt as unknown as string,
      isCurrent: session.token === currentToken,
    }));

    return result;
  }

  async deleteSession(sessionId: string, userId: string) {
    const deleted = await this.prisma.refreshToken.deleteMany({
      where: {
        id: sessionId,
        userId,
      }
    });

    if (!deleted.count) {
      throw new NotFoundError();
    }
  }

  private generateAccessToken(id: string, roleId: string) {
    return this.jwt.sign({ id, roleId }, { expiresIn: '15m' });
  }

  private generateRefreshToken(id: string, roleId: string, expirationDays: number) {
    return this.jwt.sign({ id, roleId }, { expiresIn: `${expirationDays}d` });
  }
}