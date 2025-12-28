import express from 'express';
import { z } from 'zod';
import { AnnouncementModel } from '../models/announcements.js';
import { cacheMiddleware, cacheKeys } from '../middleware/cache.js';

const router = express.Router();

// GET /api/trending - Get most viewed announcements
router.get('/', cacheMiddleware({ ttl: 600, keyGenerator: cacheKeys.trending }), async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const type = req.query.type as string;

        // Get all announcements sorted by view count
        const allAnnouncements = await AnnouncementModel.findAll({ limit: 100 });

        let filtered = allAnnouncements;
        if (type) {
            filtered = allAnnouncements.filter(a => a.type === type);
        }

        // Sort by view count (descending)
        const trending = filtered
            .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
            .slice(0, limit);

        return res.json({
            data: trending,
            count: trending.length
        });
    } catch (error) {
        console.error('Error fetching trending:', error);
        return res.status(500).json({ error: 'Failed to fetch trending' });
    }
});

// GET /api/trending/by-type - Get trending for each type
router.get('/by-type', cacheMiddleware({ ttl: 600 }), async (req, res) => {
    try {
        const allAnnouncements = await AnnouncementModel.findAll({ limit: 200 });

        const types = ['job', 'result', 'admit-card', 'answer-key', 'admission', 'syllabus'];
        const byType: Record<string, typeof allAnnouncements> = {};

        types.forEach(type => {
            byType[type] = allAnnouncements
                .filter(a => a.type === type)
                .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
                .slice(0, 5);
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
