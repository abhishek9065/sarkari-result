import dotenv from 'dotenv';

dotenv.config();

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing env var ${key}`);
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: getEnv('DATABASE_URL', 'postgres://postgres:postgres@localhost:5432/sarkari'),
  jwtSecret: getEnv('JWT_SECRET', 'dev-secret'),
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
