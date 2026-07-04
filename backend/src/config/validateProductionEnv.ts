const REQUIRED_PRODUCTION_KEYS = [
  'JWT_SECRET',
  'FRONTEND_URL',
  'CORS_ORIGINS',
  'FRONTEND_REVALIDATE_TOKEN',
  'METRICS_TOKEN',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
] as const;

const PLACEHOLDER_VALUES = new Set([
  'change-me',
  'changeme',
  'your-super-secret-jwt-key',
  'your-sendgrid-api-key',
  'your-datadog-api-key',
  'replace-with-a-long-random-token',
  'postgresql://username:password@your-do-host:25060/your_db?sslmode=require',
  'postgresql://username:password@host:5432/database?sslmode=require',
]);

function readEnv(key: string) {
  return process.env[key]?.trim() ?? '';
}

function parseBoolean(value: string, fallback = false) {
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function isLocalhostUrl(value: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:[0-9]+)?(\/|$)/i.test(value);
}

function isPlaceholder(value: string) {
  return PLACEHOLDER_VALUES.has(value.toLowerCase());
}

function requireUsableEnv(key: string, failures: string[]) {
  const value = readEnv(key);
  if (!value) {
    failures.push(`${key} is required`);
    return value;
  }

  if (isPlaceholder(value)) {
    failures.push(`${key} must not use a placeholder value`);
  }

  return value;
}

function validatePublicUrl(key: string, failures: string[]) {
  const value = readEnv(key);
  if (!value) return;

  if (isLocalhostUrl(value)) {
    failures.push(`${key} must not point to localhost or a loopback address in production`);
    return;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:') {
      failures.push(`${key} must use https in production`);
    }
  } catch {
    failures.push(`${key} must be a valid URL`);
  }
}

function validateCorsOrigins(failures: string[]) {
  const value = readEnv('CORS_ORIGINS');
  if (!value) return;

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    failures.push('CORS_ORIGINS must include at least one origin');
    return;
  }

  for (const origin of origins) {
    if (isLocalhostUrl(origin)) {
      failures.push(`CORS_ORIGINS must not include localhost origin ${origin} in production`);
      continue;
    }

    try {
      const parsed = new URL(origin);
      if (parsed.protocol !== 'https:') {
        failures.push(`CORS_ORIGINS origin ${origin} must use https in production`);
      }
    } catch {
      failures.push(`CORS_ORIGINS origin ${origin} must be a valid URL`);
    }
  }
}

export function validateProductionEnv() {
  if (process.env.NODE_ENV !== 'production') return;

  const failures: string[] = [];

  for (const key of REQUIRED_PRODUCTION_KEYS) {
    requireUsableEnv(key, failures);
  }

  const postgresPrismaUrl = readEnv('POSTGRES_PRISMA_URL');
  const databaseUrl = readEnv('DATABASE_URL');
  if (!postgresPrismaUrl && !databaseUrl) {
    failures.push('POSTGRES_PRISMA_URL or DATABASE_URL is required');
  }
  if (postgresPrismaUrl && isPlaceholder(postgresPrismaUrl)) {
    failures.push('POSTGRES_PRISMA_URL must not use a placeholder value');
  }
  if (databaseUrl && isPlaceholder(databaseUrl)) {
    failures.push('DATABASE_URL must not use a placeholder value');
  }

  const jwtSecret = readEnv('JWT_SECRET');
  if (jwtSecret && jwtSecret.length < 24) {
    failures.push('JWT_SECRET must be at least 24 characters in production');
  }

  validatePublicUrl('FRONTEND_URL', failures);
  validatePublicUrl('NEXT_PUBLIC_API_URL', failures);
  validatePublicUrl('NEXT_PUBLIC_ADMIN_URL', failures);
  validateCorsOrigins(failures);

  const frontendRevalidateUrl = readEnv('FRONTEND_REVALIDATE_URL');
  if (frontendRevalidateUrl) {
    try {
      new URL(frontendRevalidateUrl);
    } catch {
      failures.push('FRONTEND_REVALIDATE_URL must be a valid URL');
    }
  }

  if (!readEnv('FRONTEND_REVALIDATE_TOKEN') && !parseBoolean(readEnv('ALLOW_DISABLED_FRONTEND_REVALIDATION'))) {
    failures.push('FRONTEND_REVALIDATE_TOKEN is required unless ALLOW_DISABLED_FRONTEND_REVALIDATION=true');
  }

  const legacyMongoRequired = parseBoolean(readEnv('LEGACY_MONGO_REQUIRED'));
  const legacyMongoEnabled = parseBoolean(readEnv('LEGACY_MONGO_ENABLED'), legacyMongoRequired);
  if (legacyMongoRequired && !legacyMongoEnabled) {
    failures.push('LEGACY_MONGO_REQUIRED=true requires LEGACY_MONGO_ENABLED=true');
  }
  if (legacyMongoRequired && !readEnv('COSMOS_CONNECTION_STRING') && !readEnv('MONGODB_URI')) {
    failures.push('COSMOS_CONNECTION_STRING or MONGODB_URI is required when LEGACY_MONGO_REQUIRED=true');
  }

  if (failures.length > 0) {
    throw new Error(`Invalid production environment:\n- ${failures.join('\n- ')}`);
  }
}
