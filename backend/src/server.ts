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

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for bulk imports and images

// Apply rate limiting to all API routes
app.use('/api', rateLimit({ windowMs: 60000, maxRequests: 200 }));

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
