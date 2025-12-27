import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { pool } from '../db.js';
import { config } from '../config.js';

const router = express.Router();

// Store uploaded images as base64 in database (simple approach, no external storage needed)
// In production, you'd use cloud storage like AWS S3 or Cloudinary

/**
 * POST /api/upload/image
 * Upload an image (base64 encoded)
 */
router.post('/image', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { imageData, filename, announcementId } = req.body;

        if (!imageData || !filename) {
            return res.status(400).json({ error: 'imageData and filename are required' });
        }

        // Validate base64 image
        if (!imageData.startsWith('data:image/')) {
            return res.status(400).json({ error: 'Invalid image format. Must be base64 data URL' });
        }

        // Check image size (max 2MB)
        const sizeInBytes = Buffer.from(imageData.split(',')[1] || '', 'base64').length;
        if (sizeInBytes > 2 * 1024 * 1024) {
            return res.status(400).json({ error: 'Image too large. Maximum size is 2MB' });
        }

        // Store in database
        const result = await pool.query(
            `INSERT INTO images (filename, data, announcement_id, uploaded_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, filename, created_at as "createdAt"`,
            [filename, imageData, announcementId || null, req.user!.userId]
        );

        return res.json({
            success: true,
            image: result.rows[0],
            url: `${config.frontendUrl || ''}/api/upload/image/${result.rows[0].id}`,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Failed to upload image' });
    }
});

/**
 * GET /api/upload/image/:id
 * Get an uploaded image
 */
router.get('/image/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT data, filename FROM images WHERE id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const { data, filename } = result.rows[0];

        // Return the base64 data
        res.json({ imageData: data, filename });
    } catch (error) {
        console.error('Get image error:', error);
        return res.status(500).json({ error: 'Failed to get image' });
    }
});

/**
 * DELETE /api/upload/image/:id
 * Delete an uploaded image
 */
router.delete('/image/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM images WHERE id = $1 RETURNING id',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }

        return res.json({ success: true, message: 'Image deleted' });
    } catch (error) {
        console.error('Delete image error:', error);
        return res.status(500).json({ error: 'Failed to delete image' });
    }
});

export default router;
