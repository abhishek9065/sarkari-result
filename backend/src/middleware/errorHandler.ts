import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { ErrorTracking } from '../services/errorTracking.js';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

const toErrorCode = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 429:
      return 'RATE_LIMITED';
    default:
      return statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'APP_ERROR';
  }
};

type BodyParserError = Error & {
  body?: unknown;
  status?: number;
  statusCode?: number;
  type?: string;
};

const isMalformedJsonError = (err: Error): boolean => {
  const candidate = err as BodyParserError;
  return candidate.type === 'entity.parse.failed'
    || (
      err instanceof SyntaxError
      && (candidate.status === 400 || candidate.statusCode === 400)
      && Object.prototype.hasOwnProperty.call(candidate, 'body')
    );
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.requestId ?? 'unknown';
  const isCorsRejection = err.message === 'Not allowed by CORS';

  if (res.headersSent) {
    return next(err);
  }

  if (isMalformedJsonError(err)) {
    logger.warn({ path: req.path, requestId }, 'Malformed JSON request body');
    return res.status(400).json({
      status: 'fail',
      error: 'Invalid JSON',
      code: 'BAD_REQUEST',
      message: 'Request body must be valid JSON.',
      requestId,
    });
  }

  // Zod Validation Errors
  if (err instanceof ZodError) {
    logger.warn({ err: err.message, path: req.path, requestId }, 'Validation Error');
    return res.status(400).json({
      status: 'fail',
      error: 'Validation Error',
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      requestId,
      details: err.flatten(),
    });
  }

  // App Operational Errors
  if (err instanceof AppError) {
    if (err.isOperational) {
      logger.warn({ err: err.message, statusCode: err.statusCode, requestId }, `Operational Error: ${err.message}`);
      return res.status(err.statusCode).json({
        status: 'fail',
        error: err.message,
        code: toErrorCode(err.statusCode),
        message: err.message,
        requestId,
      });
    }
  }

  // Expected CORS rejection from cors() origin callback.
  // Do not treat this as an unhandled 500/Sentry exception.
  if (isCorsRejection) {
    logger.warn({ err: err.message, path: req.path, origin: req.headers.origin, requestId }, 'CORS Rejection');
    return res.status(403).json({
      status: 'fail',
      error: 'Not allowed by CORS',
      code: 'FORBIDDEN',
      message: 'Origin is not allowed',
      requestId,
    });
  }

  if ((err as { code?: string }).code === 'EBADCSRFTOKEN') {
    logger.warn({ path: req.path, requestId }, 'CSRF validation failed');
    return res.status(403).json({
      status: 'fail',
      error: 'csrf_invalid',
      code: 'FORBIDDEN',
      message: 'CSRF validation failed.',
      requestId,
    });
  }

  // Fallback for unknown/programming errors
  logger.error({ err, requestId }, 'Unhandled Exception');
  
  // Track in Sentry
  ErrorTracking.captureException(err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    requestId,
  });

  return res.status(500).json({
    status: 'error',
    error: 'Internal Server Error',
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
    requestId,
  });
};
