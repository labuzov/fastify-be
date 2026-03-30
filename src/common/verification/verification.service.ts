import { PrismaClient } from '@prisma/client';
import { randomInt } from 'crypto';
import bcrypt from 'bcrypt';
import { BadRequestError, NotFoundError } from '@/common/errors/appErrors.js';
import { ERROR_CODE } from '@/common/errors/errorCodes.js';
import { VERIFICATION_TYPE } from './types.js';

export class VerificationService {
  private readonly MAX_ATTEMPTS = 3;

  constructor(private prisma: PrismaClient) {}

  async createCode(userId: string, type: VERIFICATION_TYPE) {
    const rawCode = randomInt(100000, 999999).toString();
    const code = await bcrypt.hash(rawCode, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await this.prisma.verificationCode.upsert({
      where: { userId_type: { userId, type } },
      update: {
        code,
        attempts: 0,
        expiresAt,
        createdAt: new Date()
      },
      create: {
        userId,
        code,
        type,
        expiresAt
      },
    });

    return rawCode;
  }

  async validateAndUse(userId: string, code: string, type: VERIFICATION_TYPE) {
    const record = await this.prisma.verificationCode.findUnique({
      where: { userId_type: { userId, type } }
    });

    if (!record) {
      throw new NotFoundError();
    }

    if (new Date() > record.expiresAt) {
      await this.prisma.verificationCode.delete({ where: { id: record.id } });
      throw new BadRequestError(ERROR_CODE.VERIFY_CODE_EXPIRED);
    }

    if (record.attempts >= this.MAX_ATTEMPTS) {
      await this.prisma.verificationCode.delete({ where: { id: record.id } });
      throw new BadRequestError(ERROR_CODE.VERIFY_TOO_MANY_ATTEMPTS);
    }

    const isMatch = await bcrypt.compare(code, record.code);

    if (!isMatch) {
      await this.prisma.verificationCode.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } }
      });

      throw new BadRequestError(ERROR_CODE.VERIFY_INVALID_CODE);
    }

    await this.prisma.verificationCode.delete({ where: { id: record.id } });

    return true;
  }
}