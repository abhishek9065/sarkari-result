import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { SecurityLogger } from '../services/securityLogger.js';
import { AnnouncementModelMongo } from '../models/announcements.mongo.js';

const router = Router();

// All admin dashboard routes require admin authentication
router.use(authenticateToken, requireAdmin);

/**
 * GET /api/admin/dashboard
 * Get complete dashboard overview
 */
router.get('/dashboard', async (_req, res) => {
    try {
        // Get recent announcements
        const announcements = await AnnouncementModelMongo.findAll({ limit: 10 });

        return res.json({
            data: {
                overview: {
                    totalAnnouncements: announcements.length,
                    database: 'MongoDB (Cosmos DB)'
                },
                recentContent: announcements.map(a => ({
                    id: a.id,
                    title: a.title,
                    type: a.type
                }))
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        return res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

/**
 * GET /api/admin/stats
 * Get quick stats overview
 */
router.get('/stats', async (_req, res) => {
    try {
        const announcements = await AnnouncementModelMongo.findAll({ limit: 1000 });
        return res.json({
            data: {
                totalAnnouncements: announcements.length,
                database: 'MongoDB'
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        return res.status(500).json({ error: 'Failed to load stats' });
    }
});

/**
 * GET /api/admin/security
 * Get security logs
 */
router.get('/security', async (req, res) => {
    try {
        const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
        const logs = SecurityLogger.getRecentLogs(limit);
        return res.json({ data: logs });
    } catch (error) {
        console.error('Security logs error:', error);
        return res.status(500).json({ error: 'Failed to load security logs' });
    }
});

/**
 * GET /api/admin/announcements
 * Get all announcements for admin management
 */
router.get('/announcements', async (req, res) => {
    try {
        const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
        const offset = parseInt(req.query.offset as string) || 0;

        const announcements = await AnnouncementModelMongo.findAll({ limit, offset });

        return res.json({ data: announcements });
    } catch (error) {
        console.error('Admin announcements error:', error);
        return res.status(500).json({ error: 'Failed to load announcements' });
    }
});

/**
 * POST /api/admin/announcements
 * Create new announcement
 */
router.post('/announcements', async (req, res) => {
    try {
        const userId = typeof req.user?.userId === 'number' ? req.user.userId : 0;
        const announcement = await AnnouncementModelMongo.create(req.body, userId);
        return res.status(201).json({ data: announcement });
    } catch (error) {
        console.error('Create announcement error:', error);
        return res.status(500).json({ error: 'Failed to create announcement' });
    }
});

/**
 * PUT /api/admin/announcements/:id
 * Update announcement
 */
router.put('/announcements/:id', async (req, res) => {
    try {
        const announcement = await AnnouncementModelMongo.update(req.params.id, req.body);
        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }
        return res.json({ data: announcement });
    } catch (error) {
        console.error('Update announcement error:', error);
        return res.status(500).json({ error: 'Failed to update announcement' });
    }
});

/**
 * DELETE /api/admin/announcements/:id
 * Delete announcement
 */
router.delete('/announcements/:id', async (req, res) => {
    try {
        const deleted = await AnnouncementModelMongo.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Announcement not found' });
        }
        return res.json({ message: 'Announcement deleted' });
    } catch (error) {
        console.error('Delete announcement error:', error);
        return res.status(500).json({ error: 'Failed to delete announcement' });
    }
});

export default router;
