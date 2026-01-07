import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Get environment variable with optional fallback.
 * In production, required variables without values will throw an error.
 */
const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

/**
 * Get required environment variable (no fallback allowed in production).
 * In development, a fallback can be provided for convenience.
 */
const getRequiredEnv = (key: string, devFallback?: string): string => {
  const value = process.env[key];

  if (!value) {
    if (isProduction) {
      throw new Error(`SECURITY ERROR: Missing required env var "${key}" in production. Cannot use default values for sensitive configuration.`);
    }
    if (devFallback) {
      console.warn(`[CONFIG] Warning: Using default value for ${key} (development only)`);
      return devFallback;
    }
    throw new Error(`Missing required env var: ${key}`);
  }

  return value;
};

/**
 * Validate that a secret is not using insecure default values in production.
 */
const validateSecret = (key: string, value: string, insecureDefaults: string[]): void => {
  if (isProduction && insecureDefaults.includes(value)) {
    throw new Error(`SECURITY ERROR: "${key}" is using an insecure default value in production. Please set a secure value.`);
  }
};

// Core configuration
const databaseUrl = getRequiredEnv('DATABASE_URL', 'postgres://postgres:postgres@localhost:5432/sarkari');
const jwtSecret = getRequiredEnv('JWT_SECRET', 'dev-secret');

// Validate secrets aren't using known insecure defaults in production
validateSecret('JWT_SECRET', jwtSecret, ['dev-secret', 'change-me', 'secret', 'jwt-secret']);

export const config = {
  port: Number(process.env.PORT ?? 5000),
  databaseUrl,
  jwtSecret,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction,

  // Telegram bot config (optional - notifications disabled if not set)
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
  telegramChannelId: process.env.TELEGRAM_CHANNEL_ID ?? '',

  // SendGrid email config (optional - email notifications disabled if not set)
  emailUser: process.env.EMAIL_USER ?? '',
  emailPass: process.env.SENDGRID_API_KEY ?? process.env.EMAIL_PASS ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'Sarkari Result <noreply@sarkariresult.com>',

  // Frontend URL for links in emails
  frontendUrl: process.env.FRONTEND_URL ?? 'https://sarkariexams.me',

  // VAPID keys for web push notifications (optional in dev, required in production if push is used)
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? '',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? '',
};

// Log configuration status on startup (without exposing secrets)
if (!isProduction) {
  console.log('[CONFIG] Running in development mode');
  console.log(`[CONFIG] Database: ${databaseUrl.includes('localhost') ? 'localhost' : 'remote'}`);
  console.log(`[CONFIG] Push notifications: ${config.vapidPublicKey ? 'enabled' : 'disabled'}`);
  console.log(`[CONFIG] Email notifications: ${config.emailPass ? 'enabled' : 'disabled'}`);
  console.log(`[CONFIG] Telegram notifications: ${config.telegramBotToken ? 'enabled' : 'disabled'}`);
}
