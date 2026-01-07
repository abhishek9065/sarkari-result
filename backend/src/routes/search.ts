import express from 'express';
import { z } from 'zod';
import { AnnouncementModel } from '../models/announcements.js';
import { cacheMiddleware, cacheKeys } from '../middleware/cache.js';

const router = express.Router();

// GET /api/search - Full text search across announcements (uses database full-text search)
router.get('/', cacheMiddleware({ ttl: 120, keyGenerator: cacheKeys.search }), async (req, res) => {
    try {
        const q = (req.query.q as string || '').trim();

        if (!q || q.length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }

        const type = req.query.type as string;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
        const offset = parseInt(req.query.offset as string) || 0;

        // Use database-level full-text search (more efficient, no limit issues)
        const results = await AnnouncementModel.findAll({
            search: q,
            type: type as any,
            limit,
            offset,
            sort: 'newest',
        });

        return res.json({
            query: q,
            data: results,
            count: results.length,
            offset,
            limit,
        });
    } catch (error) {
        console.error('Error searching:', error);
        return res.status(500).json({ error: 'Search failed' });
    }
});

// GET /api/search/suggestions - Get search suggestions based on input
router.get('/suggestions', cacheMiddleware({ ttl: 300 }), async (req, res) => {
    try {
        const q = (req.query.q as string || '').trim();

        if (!q || q.length < 2) {
            return res.json({ suggestions: [] });
        }

        // Use database-level search to get matching results
        const results = await AnnouncementModel.findAll({
            search: q,
            limit: 20,
        });

        // Extract unique titles and organizations
        const suggestions = new Set<string>();
        const qLower = q.toLowerCase();

        results.forEach(a => {
            if (a.title.toLowerCase().includes(qLower)) {
                suggestions.add(a.title);
            }
            if (a.organization.toLowerCase().includes(qLower)) {
                suggestions.add(a.organization);
            }
        });

        return res.json({
            suggestions: Array.from(suggestions).slice(0, 10)
        });
    } catch (error) {
        console.error('Error getting suggestions:', error);
        return res.status(500).json({ error: 'Failed to get suggestions' });
    }
});

export default router;
