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
  // Telegram bot config (optional - notifications disabled if not set)
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
  telegramChannelId: process.env.TELEGRAM_CHANNEL_ID ?? '',
  // SendGrid email config (optional - email notifications disabled if not set)
  emailUser: process.env.EMAIL_USER ?? '',  // Not used with SendGrid but kept for compatibility
  emailPass: process.env.SENDGRID_API_KEY ?? process.env.EMAIL_PASS ?? '',  // SendGrid API key
  emailFrom: process.env.EMAIL_FROM ?? 'Sarkari Result <noreply@sarkariresult.com>',
  // Frontend URL for links in emails
  frontendUrl: process.env.FRONTEND_URL ?? 'https://sarkari-result-gold.vercel.app',
  // VAPID keys for web push notifications
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? 'BGXdZJ-xHI4YwQlWX72BpfA_qTXGY8itPaFAU1aOb2-8iaexXReuv_NOV0svk45X-B0Dnd5uiPKZxnw7pN-yiYM',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? 'lgl-ZpNZjuYocz3KC09hq_xGQI1QoYeogK33x-VFL3U',
};

