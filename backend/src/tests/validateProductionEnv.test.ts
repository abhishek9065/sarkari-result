import { afterEach, describe, expect, it } from 'vitest';

import { validateProductionEnv } from '../config/validateProductionEnv.js';

const originalEnv = { ...process.env };

function setValidProductionEnv(overrides: NodeJS.ProcessEnv = {}) {
  process.env = {
    ...originalEnv,
    NODE_ENV: 'production',
    JWT_SECRET: 'a-secure-production-secret-value',
    POSTGRES_PRISMA_URL: 'postgresql://user:pass@db.example.com:5432/app?sslmode=require',
    FRONTEND_URL: 'https://sarkariexams.me',
    CORS_ORIGINS: 'https://sarkariexams.me,https://www.sarkariexams.me',
    FRONTEND_REVALIDATE_URL: 'http://frontend:3000/api/revalidate',
    FRONTEND_REVALIDATE_TOKEN: 'secure-revalidate-token',
    UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'secure-redis-token',
    LEGACY_MONGO_REQUIRED: 'false',
    LEGACY_MONGO_ENABLED: 'false',
    NEXT_PUBLIC_API_URL: 'https://sarkariexams.me/api',
    NEXT_PUBLIC_ADMIN_URL: 'https://sarkariexams.me/admin',
    ...overrides,
  };
}

describe('validateProductionEnv', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('skips validation outside production', () => {
    process.env = { NODE_ENV: 'development' };

    expect(() => validateProductionEnv()).not.toThrow();
  });

  it('accepts the required production environment', () => {
    setValidProductionEnv({
      CORS_ORIGINS: '',
      FRONTEND_URL: '',
      METRICS_TOKEN: '',
    });

    expect(() => validateProductionEnv()).not.toThrow();
  });

  it('reports missing required production values together', () => {
    setValidProductionEnv({
      JWT_SECRET: '',
      POSTGRES_PRISMA_URL: '',
      DATABASE_URL: '',
      UPSTASH_REDIS_REST_TOKEN: '',
    });

    expect(() => validateProductionEnv()).toThrow(/JWT_SECRET is required/);
    expect(() => validateProductionEnv()).toThrow(/POSTGRES_PRISMA_URL or DATABASE_URL is required/);
    expect(() => validateProductionEnv()).toThrow(/UPSTASH_REDIS_REST_TOKEN is required/);
  });

  it('rejects placeholder secrets and localhost public URLs', () => {
    setValidProductionEnv({
      JWT_SECRET: 'your-super-secret-jwt-key',
      FRONTEND_URL: 'http://localhost:3000',
      CORS_ORIGINS: 'https://sarkariexams.me,http://localhost:3000',
    });

    expect(() => validateProductionEnv()).toThrow(/JWT_SECRET must not use a placeholder value[\s\S]*FRONTEND_URL must not point to localhost/);
  });

  it('allows localhost CORS origins for mixed local tooling but rejects non-https remote origins', () => {
    setValidProductionEnv({
      CORS_ORIGINS: 'https://sarkariexams.me,http://localhost:3000,http://example.com',
    });

    expect(() => validateProductionEnv()).toThrow(/CORS_ORIGINS origin http:\/\/example.com must use https/);
  });

  it('allows missing metrics token but rejects placeholder metrics tokens', () => {
    setValidProductionEnv({
      METRICS_TOKEN: '',
    });

    expect(() => validateProductionEnv()).not.toThrow();

    setValidProductionEnv({
      METRICS_TOKEN: 'change-me',
    });

    expect(() => validateProductionEnv()).toThrow(/METRICS_TOKEN must not use a placeholder value/);
  });

  it('requires legacy Mongo configuration only when legacy runtime is required', () => {
    setValidProductionEnv({
      LEGACY_MONGO_REQUIRED: 'true',
      LEGACY_MONGO_ENABLED: 'true',
      COSMOS_CONNECTION_STRING: '',
      MONGODB_URI: '',
    });

    expect(() => validateProductionEnv()).toThrow(/COSMOS_CONNECTION_STRING or MONGODB_URI is required/);
  });
});
