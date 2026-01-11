import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { SecurityLogger } from '../services/securityLogger.js';
import { pool } from '../db.js';

const router = Router();

// All admin dashboard routes require admin authentication
router.use(authenticateToken, requireAdmin);

/**
 * GET /api/admin/dashboard
 * Get complete dashboard overview
 */
router.get('/dashboard', async (_req, res) => {
    try {
        const [stats, categoryStats, trends, topContent, userStats] = await Promise.all([
            AnalyticsService.getDashboardStats(),
            AnalyticsService.getCategoryStats(),
            AnalyticsService.getPostingTrends(30),
            AnalyticsService.getTopContent(10),
            AnalyticsService.getUserStats()
        ]);

        return res.json({
            data: {
                overview: stats,
                categories: categoryStats,
                trends,
                topContent,
                users: userStats
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
        const stats = await AnalyticsService.getDashboardStats();
        return res.json({ data: stats });
    } catch (error) {
        console.error('Stats error:', error);
        return res.status(500).json({ error: 'Failed to load stats' });
    }
});

/**
 * GET /api/admin/trends
 * Get posting trends
 */
router.get('/trends', async (req, res) => {
    try {
        const days = Math.min(parseInt(req.query.days as string) || 30, 90);
        const trends = await AnalyticsService.getPostingTrends(days);
        return res.json({ data: trends });
    } catch (error) {
        console.error('Trends error:', error);
        return res.status(500).json({ error: 'Failed to load trends' });
    }
});

/**
 * GET /api/admin/users
 * Get user list with pagination
 */
router.get('/users', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
        const offset = (page - 1) * limit;

        const [usersResult, countResult] = await Promise.all([
            pool.query(`
                SELECT 
                    u.id, u.email, u.name, u.role, u.created_at as "createdAt",
                    (SELECT COUNT(*) FROM bookmarks WHERE user_id = u.id) as bookmarks
                FROM users u
                ORDER BY u.created_at DESC
                LIMIT $1 OFFSET $2
            `, [limit, offset]),
            pool.query('SELECT COUNT(*) FROM users')
        ]);

        return res.json({
            data: usersResult.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
            }
        });
    } catch (error) {
        console.error('Users error:', error);
        return res.status(500).json({ error: 'Failed to load users' });
    }
});

/**
 * PUT /api/admin/users/:id/role
 * Update user role (promote/demote)
 */
router.put('/users/:id/role', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, role',
            [role, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json({ data: result.rows[0], message: 'Role updated' });
    } catch (error) {
        console.error('Role update error:', error);
        return res.status(500).json({ error: 'Failed to update role' });
    }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user (soft delete or hard delete)
 */
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const adminId = req.user?.userId;

        // Prevent self-deletion
        if (userId === adminId) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }

        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        return res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('User delete error:', error);
        return res.status(500).json({ error: 'Failed to delete user' });
    }
});

/**
 * GET /api/admin/content
 * Get content list for moderation
 */
router.get('/content', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
        const offset = (page - 1) * limit;
        const status = req.query.status as string;

        let query = `
            SELECT 
                id, title, slug, type, organization, 
                is_active as "isActive", view_count as views,
                posted_at as "postedAt", deadline
            FROM announcements
        `;

        const params: any[] = [];
        if (status === 'active') {
            query += ' WHERE is_active = true';
        } else if (status === 'inactive') {
            query += ' WHERE is_active = false';
        }

        query += ` ORDER BY posted_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const [contentResult, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(`SELECT COUNT(*) FROM announcements${status ? (status === 'active' ? ' WHERE is_active = true' : ' WHERE is_active = false') : ''}`)
        ]);

        return res.json({
            data: contentResult.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
            }
        });
    } catch (error) {
        console.error('Content error:', error);
        return res.status(500).json({ error: 'Failed to load content' });
    }
});

/**
 * PUT /api/admin/content/:id/status
 * Toggle content active status
 */
router.put('/content/:id/status', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { isActive } = req.body;

        const result = await pool.query(
            'UPDATE announcements SET is_active = $1 WHERE id = $2 RETURNING id, title, is_active as "isActive"',
            [isActive, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Content not found' });
        }

        return res.json({ data: result.rows[0], message: 'Status updated' });
    } catch (error) {
        console.error('Status update error:', error);
        return res.status(500).json({ error: 'Failed to update status' });
    }
});

/**
 * GET /api/admin/activity
 * Get recent activity log
 */
router.get('/activity', async (req, res) => {
    try {
        const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
        const activity = await AnalyticsService.getRecentActivity(limit);
        return res.json({ data: activity });
    } catch (error) {
        console.error('Activity error:', error);
        return res.status(500).json({ error: 'Failed to load activity' });
    }
});

/**
 * GET /api/admin/subscriptions
 * Get email subscription stats
 */
router.get('/subscriptions', async (req, res) => {
    try {
        const [statsResult, listResult] = await Promise.all([
            pool.query(`
                SELECT 
                    COUNT(*) FILTER (WHERE is_verified = true) as verified,
                    COUNT(*) FILTER (WHERE is_verified = false) as pending,
                    COUNT(*) as total
                FROM email_subscriptions
            `),
            pool.query(`
                SELECT email, categories, is_verified, created_at
                FROM email_subscriptions
                ORDER BY created_at DESC
                LIMIT 20
            `)
        ]);

        return res.json({
            data: {
                stats: statsResult.rows[0],
                recent: listResult.rows
            }
        });
    } catch (error) {
        console.error('Subscriptions error:', error);
        return res.status(500).json({ error: 'Failed to load subscriptions' });
    }
});

router.get('/security/logs', async (req, res) => {
    try {
        const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
        const logs = await SecurityLogger.getRecentLogs(limit);
        return res.json({ data: logs });
    } catch (error) {
        console.error('Security logs error:', error);
        return res.status(500).json({ error: 'Failed to load security logs' });
    }
});

/**
 * GET /api/admin/test-error
 * Trigger a test error to verify Sentry is working
 */
router.get('/test-error', async (_req, res) => {
    try {
        // This will throw an error intentionally
        throw new Error('Test error to verify Sentry integration');
    } catch (error) {
        const { captureException } = await import('../services/errorTracking.js');
        captureException(error as Error, { source: 'admin-test-endpoint' });
        return res.status(500).json({
            message: 'Test error triggered and sent to Sentry!',
            error: (error as Error).message
        });
    }
});

/**
 * GET /api/admin/recent-errors
 * View recent errors from local log
 */
router.get('/recent-errors', async (req, res) => {
    try {
        const { getRecentErrors } = await import('../services/errorTracking.js');
        const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
        const errors = getRecentErrors(limit);
        return res.json({ data: errors });
    } catch (error) {
        console.error('Recent errors error:', error);
        return res.status(500).json({ error: 'Failed to load errors' });
    }
});

export default router;

