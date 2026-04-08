import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/common/errors/appErrors.js';
import { ERROR_CODE } from '@/common/errors/errorCodes.js';
import { ChangePasswordBody } from './profile.schema.js';

export class ProfileService {
  constructor(private prisma: PrismaClient) {}

  async changePassword(id: string, body: ChangePasswordBody, refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedError();
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw new BadRequestError(ERROR_CODE.AUTH_INVALID_CREDENTIALS);
    }

    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      }),
      this.prisma.refreshToken.deleteMany({
        where: {
          userId: id,
          token: { not: refreshToken }
        }
      })
    ]);
  }

  async getUserInfo(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        name: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
      },
    });

    if (!user) {
      throw new NotFoundError();
    }

    return user;
  }

  async verifyEmail(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { isEmailVerified: true }
    });
  }
}