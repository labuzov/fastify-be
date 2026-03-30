import { ERROR_CODE } from './errorCodes.js';

export class AppError extends Error {
  constructor(
    public statusCode = 500,
    public code = ERROR_CODE.INTERNAL_ERROR
  ) {
    super(code);

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(code = ERROR_CODE.BAD_REQUEST) {
    super(400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(code = ERROR_CODE.UNAUTHORIZED) {
    super(401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(code = ERROR_CODE.FORBIDDEN) {
    super(403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(code = ERROR_CODE.NOT_FOUND) {
    super(404, code);
  }
}