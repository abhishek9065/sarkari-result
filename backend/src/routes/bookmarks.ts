import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All bookmarks routes require authentication
router.use(authenticateToken);

/**
 * GET /api/bookmarks
 * Get user's bookmarks (stub - returns empty)
 */
router.get('/', async (_req, res) => {
    return res.json({ data: [] });
});

/**
 * GET /api/bookmarks/ids
 * Get user's bookmarked announcement IDs (stub - returns empty)
 */
router.get('/ids', async (_req, res) => {
    return res.json({ data: [] });
});

/**
 * POST /api/bookmarks
 * Add bookmark (stub - not implemented)
 */
router.post('/', async (_req, res) => {
    return res.status(501).json({ error: 'Bookmarks not available (PostgreSQL removed)' });
});

/**
 * DELETE /api/bookmarks/:id
 * Remove bookmark (stub - not implemented)
 */
router.delete('/:id', async (_req, res) => {
    return res.status(501).json({ error: 'Bookmarks not available (PostgreSQL removed)' });
});

export default router;
