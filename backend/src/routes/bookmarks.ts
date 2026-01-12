import { Router, Request, Response } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/bookmarks
 * Get user's bookmarks (returns empty if not logged in)
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
    // If not logged in, return empty
    if (!req.user) {
        return res.json({ data: [] });
    }
    // Stub - return empty (bookmarks not implemented with MongoDB)
    return res.json({ data: [] });
});

/**
 * GET /api/bookmarks/ids
 * Get user's bookmarked announcement IDs (returns empty if not logged in)
 */
router.get('/ids', optionalAuth, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.json({ data: [] });
    }
    return res.json({ data: [] });
});

/**
 * POST /api/bookmarks
 * Add bookmark (requires auth, stub)
 */
router.post('/', authenticateToken, async (_req: Request, res: Response) => {
    return res.status(501).json({ error: 'Bookmarks feature temporarily unavailable' });
});

/**
 * DELETE /api/bookmarks/:id
 * Remove bookmark (requires auth, stub)
 */
router.delete('/:id', authenticateToken, async (_req: Request, res: Response) => {
    return res.status(501).json({ error: 'Bookmarks feature temporarily unavailable' });
});

export default router;
