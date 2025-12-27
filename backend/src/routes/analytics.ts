import express from 'express';
import { pool } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/analytics/overview
 * Get overview stats (admin only)
 */
router.get('/overview', authenticateToken, requireAdmin, async (_req, res) => {
    try {
        // Get total stats
        const [
            totalAnnouncements,
            totalViews,
            totalSubscribers,
            totalPushSubscribers
        ] = await Promise.all([
            pool.query('SELECT COUNT(*) as count FROM announcements WHERE is_active = true'),
            pool.query('SELECT COALESCE(SUM(view_count), 0) as total FROM announcements'),
            pool.query('SELECT COUNT(*) as count FROM email_subscriptions WHERE is_verified = true'),
            pool.query('SELECT COUNT(*) as count FROM push_subscriptions')
        ]);

        // Get breakdown by type
        const typeBreakdown = await pool.query(`
            SELECT type, COUNT(*) as count 
            FROM announcements 
            WHERE is_active = true 
            GROUP BY type 
            ORDER BY count DESC
        `);

        // Get breakdown by category
        const categoryBreakdown = await pool.query(`
            SELECT category, COUNT(*) as count 
            FROM announcements 
            WHERE is_active = true 
            GROUP BY category 
            ORDER BY count DESC
            LIMIT 10
        `);

        return res.json({
            data: {
                totalAnnouncements: parseInt(totalAnnouncements.rows[0]?.count || '0'),
                totalViews: parseInt(totalViews.rows[0]?.total || '0'),
                totalEmailSubscribers: parseInt(totalSubscribers.rows[0]?.count || '0'),
                totalPushSubscribers: parseInt(totalPushSubscribers.rows[0]?.count || '0'),
                typeBreakdown: typeBreakdown.rows,
                categoryBreakdown: categoryBreakdown.rows,
            }
        });
    } catch (error) {
        console.error('Error fetching analytics overview:', error);
        return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

/**
 * GET /api/analytics/popular
 * Get popular announcements by views (admin only)
 */
router.get('/popular', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

        const result = await pool.query(`
            SELECT id, title, slug, type, category, organization, 
                   view_count as "viewCount", posted_at as "postedAt"
            FROM announcements 
            WHERE is_active = true 
            ORDER BY view_count DESC 
            LIMIT $1
        `, [limit]);

        return res.json({ data: result.rows });
    } catch (error) {
        console.error('Error fetching popular announcements:', error);
        return res.status(500).json({ error: 'Failed to fetch popular announcements' });
    }
});

/**
 * GET /api/analytics/recent
 * Get recent activity stats (admin only)
 */
router.get('/recent', authenticateToken, requireAdmin, async (_req, res) => {
    try {
        // Get posts in last 7 days
        const recentPosts = await pool.query(`
            SELECT DATE(posted_at) as date, COUNT(*) as count
            FROM announcements 
            WHERE posted_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(posted_at)
            ORDER BY date DESC
        `);

        // Get recent subscriptions
        const recentSubscriptions = await pool.query(`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM email_subscriptions 
            WHERE created_at >= NOW() - INTERVAL '7 days' AND is_verified = true
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);

        return res.json({
            data: {
                recentPosts: recentPosts.rows,
                recentSubscriptions: recentSubscriptions.rows,
            }
        });
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        return res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
});

export default router;
