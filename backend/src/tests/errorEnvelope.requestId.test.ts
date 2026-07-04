import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { errorHandler } from '../middleware/errorHandler.js';
import { requestIdMiddleware } from '../middleware/requestId.js';
import { app as serverApp } from '../server.js';
import { ErrorTracking } from '../services/errorTracking.js';
import { AppError } from '../utils/AppError.js';

const createErrorHarness = () => {
  const app = express();
  app.use(requestIdMiddleware);
  app.use(express.json());
  app.get('/boom', () => {
    throw new Error('boom');
  });
  app.get('/forbidden', () => {
    throw new AppError('Forbidden test error', 403);
  });
  app.post('/echo', (req, res) => {
    res.json(req.body);
  });
  app.use(errorHandler);
  return app;
};

describe('request id + error envelope', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns standardized envelope for unhandled errors', async () => {
    const app = createErrorHarness();
    const response = await request(app).get('/boom').set('X-Request-Id', 'req-test-123');

    expect(response.status).toBe(500);
    expect(response.headers['x-request-id']).toBe('req-test-123');
    expect(response.body).toMatchObject({
      error: 'Internal Server Error',
      code: 'INTERNAL_SERVER_ERROR',
      requestId: 'req-test-123',
    });
    expect(typeof response.body.message).toBe('string');
  });

  it('returns standardized envelope for operational AppError responses', async () => {
    const app = createErrorHarness();
    const response = await request(app).get('/forbidden');

    expect(response.status).toBe(403);
    expect(response.headers['x-request-id']).toBeTruthy();
    expect(response.body).toMatchObject({
      error: 'Forbidden test error',
      code: 'FORBIDDEN',
      message: 'Forbidden test error',
      requestId: response.headers['x-request-id'],
    });
  });

  it('returns a 400 envelope for malformed JSON without capturing to Sentry', async () => {
    const captureSpy = vi.spyOn(ErrorTracking, 'captureException');
    const app = createErrorHarness();

    const response = await request(app)
      .post('/echo')
      .set('Content-Type', 'application/json')
      .set('X-Request-Id', 'req-json-123')
      .send('@@KCnYR');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'fail',
      error: 'Invalid JSON',
      code: 'BAD_REQUEST',
      message: 'Request body must be valid JSON.',
      requestId: 'req-json-123',
    });
    expect(captureSpy).not.toHaveBeenCalled();
  });

  it('returns a 400 envelope for trailing garbage after JSON', async () => {
    const app = createErrorHarness();
    const response = await request(app)
      .post('/echo')
      .set('Content-Type', 'application/json')
      .send('{"email":"sample@email.tst"}garbage');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'fail',
      error: 'Invalid JSON',
      code: 'BAD_REQUEST',
      message: 'Request body must be valid JSON.',
    });
  });

  it('treats malformed JSON on password recovery as a bad request', async () => {
    const captureSpy = vi.spyOn(ErrorTracking, 'captureException');

    const response = await request(serverApp)
      .post('/api/auth/password-recovery/request')
      .set('Content-Type', 'application/json')
      .send('@@KCnYR');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'Invalid JSON',
      code: 'BAD_REQUEST',
      message: 'Request body must be valid JSON.',
    });
    expect(captureSpy).not.toHaveBeenCalled();
  });

  it('returns API fallback with code and request id under Express 5', async () => {
    const response = await request(serverApp).get('/api/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.headers['x-request-id']).toBeTruthy();
    expect(response.body).toMatchObject({
      error: 'Endpoint not found',
      code: 'NOT_FOUND',
      requestId: response.headers['x-request-id'],
    });
  });
});
