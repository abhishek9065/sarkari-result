import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { AnnouncementModelMongo as AnnouncementModel } from '../models/announcements.mongo.js';
import { CreateAnnouncementDto, ContentType } from '../types.js';

const router = express.Router();

/**
 * POST /api/bulk/import
 * Bulk import announcements from CSV-like JSON array
 */
router.post('/import', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { announcements } = req.body;

        if (!Array.isArray(announcements) || announcements.length === 0) {
            return res.status(400).json({ error: 'announcements array is required' });
        }

        if (announcements.length > 100) {
            return res.status(400).json({ error: 'Maximum 100 announcements per import' });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[],
        };

        for (const item of announcements) {
            try {
                // Validate required fields
                if (!item.title || !item.type || !item.category || !item.organization) {
                    results.failed++;
                    results.errors.push(`Missing required fields for: ${item.title || 'unknown'}`);
                    continue;
                }

                // Validate type
                const validTypes: ContentType[] = ['job', 'result', 'admit-card', 'syllabus', 'answer-key', 'admission'];
                if (!validTypes.includes(item.type)) {
                    results.failed++;
                    results.errors.push(`Invalid type "${item.type}" for: ${item.title}`);
                    continue;
                }

                const dto: CreateAnnouncementDto = {
                    title: item.title,
                    type: item.type as ContentType,
                    category: item.category,
                    organization: item.organization,
                    content: item.content || '',
                    externalLink: item.externalLink || '',
                    location: item.location || 'All India',
                    deadline: item.deadline || undefined,
                    minQualification: item.minQualification || '',
                    ageLimit: item.ageLimit || '',
                    applicationFee: item.applicationFee || '',
                    totalPosts: item.totalPosts ? parseInt(item.totalPosts) : undefined,
                    tags: item.tags || [],
                };

                await AnnouncementModel.create(dto, req.user!.userId);
                results.success++;
            } catch (err: any) {
                results.failed++;
                results.errors.push(`Error importing "${item.title}": ${err.message}`);
            }
        }

        return res.json({
            message: `Import complete: ${results.success} success, ${results.failed} failed`,
            ...results,
        });
    } catch (error) {
        console.error('Bulk import error:', error);
        return res.status(500).json({ error: 'Failed to process bulk import' });
    }
});

/**
 * GET /api/bulk/template
 * Get CSV template format
 */
router.get('/template', (_req, res) => {
    res.json({
        format: 'JSON array of announcement objects',
        example: {
            announcements: [
                {
                    title: 'SSC CGL 2025 Recruitment',
                    type: 'job',
                    category: 'Central Government',
                    organization: 'Staff Selection Commission',
                    externalLink: 'https://ssc.nic.in',
                    location: 'All India',
                    deadline: '2025-03-15',
                    totalPosts: 5000,
                    minQualification: 'Graduate',
                    ageLimit: '18-32 years',
                    applicationFee: '100',
                    tags: ['SSC', 'CGL', 'Graduate'],
                },
            ],
        },
        requiredFields: ['title', 'type', 'category', 'organization'],
        validTypes: ['job', 'result', 'admit-card', 'syllabus', 'answer-key', 'admission'],
    });
});

export default router;
