import { Router } from 'express';
import { scrapeAllSources } from '../services/scraper.js';
import { pool } from '../db.js';

const router = Router();

/**
 * Manually trigger a scrape (admin only)
 * POST /api/scraper/run
 */
router.post('/run', async (req, res) => {
    try {
        // Verify admin token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        console.log('[Scraper API] Manual scrape triggered');
        const result = await scrapeAllSources();

        res.json({
            success: true,
            message: `Scrape complete. Added ${result.added} new jobs, skipped ${result.skipped} duplicates.`,
            data: result,
        });
    } catch (error) {
        console.error('[Scraper API] Error:', error);
        res.status(500).json({ error: 'Scrape failed' });
    }
});

/**
 * Get scraper stats
 * GET /api/scraper/stats
 */
router.get('/stats', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                scraped_from as source,
                COUNT(*) as count,
                MAX(created_at) as last_scraped
            FROM announcements
            WHERE scraped_from IS NOT NULL
            GROUP BY scraped_from
            ORDER BY count DESC
        `);

        const total = await pool.query(`
            SELECT COUNT(*) as count FROM announcements WHERE scraped_from IS NOT NULL
        `);

        res.json({
            success: true,
            data: {
                totalScraped: parseInt(total.rows[0]?.count || '0'),
                bySources: result.rows,
            },
        });
    } catch (error) {
        console.error('[Scraper API] Stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

/**
 * Get recent scraped jobs
 * GET /api/scraper/recent
 */
router.get('/recent', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

        const result = await pool.query(`
            SELECT id, title, slug, type, category, organization, scraped_from, created_at
            FROM announcements
            WHERE scraped_from IS NOT NULL
            ORDER BY created_at DESC
            LIMIT $1
        `, [limit]);

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error('[Scraper API] Recent error:', error);
        res.status(500).json({ error: 'Failed to get recent' });
    }
});

export default router;
