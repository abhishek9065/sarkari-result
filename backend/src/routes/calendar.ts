import express from 'express';
import { z } from 'zod';
import { AnnouncementModel } from '../models/announcements.js';
import { cacheMiddleware, cacheKeys } from '../middleware/cache.js';

const router = express.Router();

// GET /api/calendar - Get announcements grouped by date for calendar view
router.get('/', cacheMiddleware({ ttl: 600, keyGenerator: cacheKeys.calendar }), async (req, res) => {
    try {
        const year = parseInt(req.query.year as string) || new Date().getFullYear();
        const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;

        // Get all announcements with deadlines in the specified month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const allAnnouncements = await AnnouncementModel.findAll({ limit: 200 });

        // Filter to only those with deadlines in the month
        const filteredAnnouncements = allAnnouncements.filter(a => {
            if (!a.deadline) return false;
            const deadline = new Date(a.deadline);
            return deadline >= startDate && deadline <= endDate;
        });

        // Group by date
        const byDate: Record<string, typeof filteredAnnouncements> = {};
        filteredAnnouncements.forEach(a => {
            const dateKey = new Date(a.deadline!).toISOString().split('T')[0];
            if (!byDate[dateKey]) byDate[dateKey] = [];
            byDate[dateKey].push(a);
        });

        return res.json({
            year,
            month,
            events: byDate,
            totalEvents: filteredAnnouncements.length
        });
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        return res.status(500).json({ error: 'Failed to fetch calendar data' });
    }
});

// GET /api/calendar/upcoming - Get upcoming deadlines for next 30 days
router.get('/upcoming', cacheMiddleware({ ttl: 300 }), async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 20;
        const now = new Date();
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const allAnnouncements = await AnnouncementModel.findAll({ limit: 200 });

        const upcoming = allAnnouncements
            .filter(a => {
                if (!a.deadline) return false;
                const deadline = new Date(a.deadline);
                return deadline >= now && deadline <= thirtyDaysLater;
            })
            .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
            .slice(0, limit);

        return res.json({
            data: upcoming,
            count: upcoming.length
        });
    } catch (error) {
        console.error('Error fetching upcoming deadlines:', error);
        return res.status(500).json({ error: 'Failed to fetch upcoming deadlines' });
    }
});

export default router;
