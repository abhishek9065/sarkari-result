import cors from 'cors';
import express from 'express';

import { config } from './config.js';
import announcementsRouter from './routes/announcements.js';
import authRouter from './routes/auth.js';
import bookmarksRouter from './routes/bookmarks.js';
import subscriptionsRouter from './routes/subscriptions.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/bookmarks', bookmarksRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/subscriptions', subscriptionsRouter);


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
