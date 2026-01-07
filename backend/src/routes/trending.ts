import express from 'express';
import { AnnouncementModel } from '../models/announcements.js';
import { cacheMiddleware, cacheKeys } from '../middleware/cache.js';
import { ContentType } from '../types.js';

const router = express.Router();

// GET /api/trending - Get most viewed announcements (database-level sorting)
router.get('/', cacheMiddleware({ ttl: 600, keyGenerator: cacheKeys.trending }), async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
        const type = req.query.type as ContentType | undefined;

        // Use database-level sorting by view count
        const trending = await AnnouncementModel.getTrending({ type, limit });

        return res.json({
            data: trending,
            count: trending.length
        });
    } catch (error) {
        console.error('Error fetching trending:', error);
        return res.status(500).json({ error: 'Failed to fetch trending' });
    }
});

// GET /api/trending/by-type - Get trending for each type (efficient parallel queries)
router.get('/by-type', cacheMiddleware({ ttl: 600 }), async (req, res) => {
    try {
        const types: ContentType[] = ['job', 'result', 'admit-card', 'answer-key', 'admission', 'syllabus'];

        // Run all queries in parallel for efficiency
        const results = await Promise.all(
            types.map(type => AnnouncementModel.getTrending({ type, limit: 5 }))
        );

        const byType: Record<string, any[]> = {};
        types.forEach((type, index) => {
            byType[type] = results[index];
        });

        return res.json({
            data: byType
        });
    } catch (error) {
        console.error('Error fetching trending by type:', error);
        return res.status(500).json({ error: 'Failed to fetch trending' });
    }
});

export default router;
