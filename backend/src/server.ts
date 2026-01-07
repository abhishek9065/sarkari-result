import cors from 'cors';
import express from 'express';

import { config } from './config.js';
import announcementsRouter from './routes/announcements.js';
import authRouter from './routes/auth.js';
import bookmarksRouter from './routes/bookmarks.js';
import subscriptionsRouter from './routes/subscriptions.js';
import pushRouter from './routes/push.js';
import analyticsRouter from './routes/analytics.js';
import rssRouter from './routes/rss.js';
import sitemapRouter from './routes/sitemap.js';
import bulkRouter from './routes/bulk.js';
import uploadRouter from './routes/upload.js';
import calendarRouter from './routes/calendar.js';
import trendingRouter from './routes/trending.js';
import searchRouter from './routes/search.js';
import scraperRouter from './routes/scraper.js';
import jobsRouter from './routes/jobs.js';
import { startScheduledScraper } from './services/scheduler.js';
import { rateLimit } from './middleware/rateLimit.js';
import { responseTimeLogger, getPerformanceStats } from './middleware/responseTime.js';
import {
  securityHeaders,
  blockSuspiciousAgents,
  sanitizeRequestBody
} from './middleware/security.js';

const app = express();

// Trust proxy for accurate IP detection behind reverse proxies
app.set('trust proxy', 1);

// ============ SECURITY MIDDLEWARE ============
// Apply security headers (Helmet)
app.use(securityHeaders);

// Block known vulnerability scanners
app.use(blockSuspiciousAgents);

// CORS configuration - restrict to known origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://sarkari-result-gold.vercel.app',
  'https://sarkari-result.vercel.app',
  'https://sarkariexams.me',
  'https://www.sarkariexams.me'
];

// Regex pattern to match Vercel preview URLs
const vercelPreviewPattern = /^https:\/\/sarkari-result(-[a-z0-9]+)?(-[a-z0-9-]+)?\.vercel\.app$/;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Check exact matches
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    // Check Vercel preview URL pattern (handles dynamic deployment URLs)
    if (vercelPreviewPattern.test(origin)) {
      callback(null, true);
      return;
    }

    console.log(`[SECURITY] Blocked CORS request from: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '5mb' })); // Reduced from 10mb for security

// Sanitize all request bodies
app.use(sanitizeRequestBody);

// Apply rate limiting to all API routes (optimized for 2000+ users)
app.use('/api', rateLimit({ windowMs: 60000, maxRequests: 200 })); // Increased from 100 to 200

// Stricter rate limiting for auth endpoints (prevent brute force)
app.use('/api/auth', rateLimit({ windowMs: 60000, maxRequests: 20 })); // Increased from 10 to 20

// Response time logging for performance monitoring
app.use(responseTimeLogger);

// Root route - basic health check
app.get('/', (_req, res) => {
  res.json({
    service: 'SarkariExams API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      announcements: '/api/announcements',
      search: '/api/search',
      trending: '/api/trending'
    }
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Performance stats endpoint (admin only in production)
app.get('/api/performance', (_req, res) => {
  res.json({ data: getPerformanceStats() });
});

app.use('/api/auth', authRouter);
app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/push', pushRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/rss', rssRouter);
app.use('/api/sitemap.xml', sitemapRouter);
app.use('/api/bulk', bulkRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/trending', trendingRouter);
app.use('/api/search', searchRouter);
app.use('/api/scraper', scraperRouter);
app.use('/api/jobs', jobsRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Basic error handler to avoid leaking stack traces in production.
  console.error(err);

  if (res.headersSent) return _next(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}`);

  // Start the job scraper scheduler
  if (process.env.NODE_ENV === 'production') {
    startScheduledScraper();
  }
});
