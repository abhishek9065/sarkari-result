import express from 'express';
import { z } from 'zod';

import { authenticateToken } from '../middleware/auth.js';
import { BookmarkModel } from '../models/bookmarks.js';

const router = express.Router();

const addBookmarkSchema = z.object({
    announcementId: z.number().int().positive(),
});

// Add a bookmark
router.post('/', authenticateToken, async (req, res) => {
    try {
        const validated = addBookmarkSchema.parse(req.body);
        const userId = req.user!.userId;

        const bookmark = await BookmarkModel.create(userId, validated.announcementId);
        return res.status(201).json({ data: bookmark });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.flatten() });
        }
        console.error('Add bookmark error:', error);
        return res.status(500).json({ error: 'Failed to add bookmark' });
    }
});

// Get all bookmarks for the user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const bookmarks = await BookmarkModel.findByUser(userId);
        return res.json({ data: bookmarks, count: bookmarks.length });
    } catch (error) {
        console.error('Get bookmarks error:', error);
        return res.status(500).json({ error: 'Failed to get bookmarks' });
    }
});

// Get all bookmarked announcement IDs (for quick lookup)
router.get('/ids', authenticateToken, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const ids = await BookmarkModel.getBookmarkedIds(userId);
        return res.json({ data: ids });
    } catch (error) {
        console.error('Get bookmark IDs error:', error);
        return res.status(500).json({ error: 'Failed to get bookmark IDs' });
    }
});

// Check if an announcement is bookmarked
router.get('/check/:announcementId', authenticateToken, async (req, res) => {
    try {
        const announcementId = parseInt(req.params.announcementId, 10);
        if (isNaN(announcementId)) {
            return res.status(400).json({ error: 'Invalid announcement ID' });
        }

        const userId = req.user!.userId;
        const isBookmarked = await BookmarkModel.exists(userId, announcementId);
        return res.json({ data: { isBookmarked } });
    } catch (error) {
        console.error('Check bookmark error:', error);
        return res.status(500).json({ error: 'Failed to check bookmark' });
    }
});

// Remove a bookmark
router.delete('/:announcementId', authenticateToken, async (req, res) => {
    try {
        const announcementId = parseInt(req.params.announcementId, 10);
        if (isNaN(announcementId)) {
            return res.status(400).json({ error: 'Invalid announcement ID' });
        }

        const userId = req.user!.userId;
        const deleted = await BookmarkModel.delete(userId, announcementId);

        if (!deleted) {
            return res.status(404).json({ error: 'Bookmark not found' });
        }

        return res.json({ data: { success: true } });
    } catch (error) {
        console.error('Delete bookmark error:', error);
        return res.status(500).json({ error: 'Failed to delete bookmark' });
    }
});

export default router;
