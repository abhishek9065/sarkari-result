import express from 'express';
import { z } from 'zod';
import { AnnouncementModel } from '../models/announcements.js';
import { cacheMiddleware, cacheKeys } from '../middleware/cache.js';

const router = express.Router();

// GET /api/search - Full text search across announcements
router.get('/', cacheMiddleware({ ttl: 120, keyGenerator: cacheKeys.search }), async (req, res) => {
    try {
        const q = (req.query.q as string || '').trim().toLowerCase();

        if (!q || q.length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }

        const type = req.query.type as string;
        const limit = parseInt(req.query.limit as string) || 20;

        // Get all announcements and filter
        const allAnnouncements = await AnnouncementModel.findAll({ limit: 200 });

        let results = allAnnouncements.filter(a =>
            a.title.toLowerCase().includes(q) ||
            a.organization.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q) ||
            (a.content && a.content.toLowerCase().includes(q))
        );

        if (type) {
            results = results.filter(a => a.type === type);
        }

        // Sort by relevance (title matches first, then by date)
        results.sort((a, b) => {
            const aInTitle = a.title.toLowerCase().includes(q) ? 1 : 0;
            const bInTitle = b.title.toLowerCase().includes(q) ? 1 : 0;
            if (aInTitle !== bInTitle) return bInTitle - aInTitle;
            return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
        });

        return res.json({
            query: q,
            data: results.slice(0, limit),
            count: results.length,
            totalResults: results.length
        });
    } catch (error) {
        console.error('Error searching:', error);
        return res.status(500).json({ error: 'Search failed' });
    }
});

// GET /api/search/suggestions - Get search suggestions based on input
router.get('/suggestions', cacheMiddleware({ ttl: 300 }), async (req, res) => {
    try {
        const q = (req.query.q as string || '').trim().toLowerCase();

        if (!q || q.length < 2) {
            return res.json({ suggestions: [] });
        }

        const allAnnouncements = await AnnouncementModel.findAll({ limit: 100 });

        // Get unique matching titles and organizations
        const suggestions = new Set<string>();

        allAnnouncements.forEach(a => {
            if (a.title.toLowerCase().includes(q)) {
                suggestions.add(a.title);
            }
            if (a.organization.toLowerCase().includes(q)) {
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
