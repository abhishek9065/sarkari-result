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
import { rateLimit } from './middleware/rateLimit.js';
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
  'https://sarkari-result.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`[SECURITY] Blocked CORS request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '5mb' })); // Reduced from 10mb for security

// Sanitize all request bodies
app.use(sanitizeRequestBody);

// Apply rate limiting to all API routes
app.use('/api', rateLimit({ windowMs: 60000, maxRequests: 100 })); // Reduced from 200

// Stricter rate limiting for auth endpoints
app.use('/api/auth', rateLimit({ windowMs: 60000, maxRequests: 10 }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Basic error handler to avoid leaking stack traces in production.
  console.error(err);

  if (res.headersSent) return _next(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${config.port}`);
});
