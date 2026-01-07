import express from 'express';
import { z } from 'zod';

import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { cacheMiddleware, cacheKeys } from '../middleware/cache.js';
import { cacheControl } from '../middleware/cacheControl.js';
import { invalidateCache } from '../utils/cache.js';
import { AnnouncementModel } from '../models/announcements.js';
import { SubscriptionModel } from '../models/subscriptions.js';
import { ContentType, CreateAnnouncementDto } from '../types.js';
import { sendAnnouncementNotification } from '../services/telegram.js';
import { sendAnnouncementEmail, isEmailConfigured } from '../services/email.js';
import { sendPushNotification } from '../services/push.js';

const router = express.Router();

const querySchema = z.object({
  type: z
    .enum(['job', 'result', 'admit-card', 'syllabus', 'answer-key', 'admission'] as [ContentType, ...ContentType[]])
    .optional(),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  organization: z.string().trim().optional(),
  qualification: z.string().trim().optional(),
  sort: z.enum(['newest', 'oldest', 'deadline']).default('newest'),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

// Get all announcements - with caching (5 min server, 2 min browser)
router.get('/', cacheMiddleware({ ttl: 300, keyGenerator: cacheKeys.announcements }), cacheControl(120), async (req, res) => {
  try {
    const parseResult = querySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    const filters = parseResult.data;
    const announcements = await AnnouncementModel.findAll(filters);

    return res.json({ data: announcements, count: announcements.length });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Get categories - long cache (1 hour)
router.get('/meta/categories', cacheMiddleware({ ttl: 3600 }), cacheControl(1800), async (_req, res) => {
  try {
    const categories = await AnnouncementModel.getCategories();
    return res.json({ data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get organizations - long cache (1 hour)
router.get('/meta/organizations', cacheMiddleware({ ttl: 3600 }), cacheControl(1800), async (_req, res) => {
  try {
    const organizations = await AnnouncementModel.getOrganizations();
    return res.json({ data: organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// Get tags - medium cache (30 min)
router.get('/meta/tags', cacheMiddleware({ ttl: 1800 }), cacheControl(600), async (_req, res) => {
  try {
    const tags = await AnnouncementModel.getTags();
    return res.json({ data: tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Get single announcement by slug - with caching (10 min server, 5 min browser)
router.get('/:slug', cacheMiddleware({ ttl: 600, keyGenerator: cacheKeys.announcementBySlug }), cacheControl(300), async (req, res) => {
  try {
    const announcement = await AnnouncementModel.findBySlug(req.params.slug);

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Increment view count (fire and forget, don't block response)
    AnnouncementModel.incrementViewCount(announcement.id).catch(console.error);

    return res.json({ data: announcement });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return res.status(500).json({ error: 'Failed to fetch announcement' });
  }
});

// Create announcement schema
const createAnnouncementSchema = z.object({
  title: z.string().min(10).max(500),
  type: z.enum(['job', 'result', 'admit-card', 'syllabus', 'answer-key', 'admission'] as [ContentType, ...ContentType[]]),
  category: z.string().min(3).max(255),
  organization: z.string().min(2).max(255),
  content: z.string().optional(),
  externalLink: z.string().url().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  deadline: z.string().datetime().optional().or(z.literal('')).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  minQualification: z.string().optional().or(z.literal('')),
  ageLimit: z.string().optional().or(z.literal('')),
  applicationFee: z.string().optional().or(z.literal('')),
  totalPosts: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  importantDates: z.array(z.object({
    eventName: z.string(),
    eventDate: z.string(),
    description: z.string().optional(),
  })).optional(),
});

// Create announcement (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const parseResult = createAnnouncementSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    const data = parseResult.data;
    const announcement = await AnnouncementModel.create(data as unknown as CreateAnnouncementDto, req.user!.userId);

    // Send Telegram notification (async, don't block response)
    sendAnnouncementNotification(announcement).catch(err => {
      console.error('Failed to send Telegram notification:', err);
    });

    // Send email notifications to subscribers (async, don't block response)
    if (isEmailConfigured()) {
      (async () => {
        try {
          const subscribers = await SubscriptionModel.getSubscribersForCategory(announcement.type);
          if (subscribers.length > 0) {
            const tokenMap = new Map(subscribers.map(s => [s.email, s.unsubscribeToken]));
            const emails = subscribers.map(s => s.email);
            await sendAnnouncementEmail(emails, announcement, tokenMap);
          }
        } catch (err) {
          console.error('Failed to send email notifications:', err);
        }
      })();
    }

    // Send push notifications to subscribers (async, don't block response)
    sendPushNotification(announcement).catch(err => {
      console.error('Failed to send push notifications:', err);
    });

    // Invalidate cached announcement lists
    invalidateCache('announcements');
    invalidateCache('trending');
    invalidateCache('search');

    return res.status(201).json({ data: announcement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Update announcement (admin only)
router.patch('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid announcement ID' });
    }

    const updateSchema = createAnnouncementSchema.partial();
    const parseResult = updateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    const announcement = await AnnouncementModel.update(id, parseResult.data as unknown as Partial<CreateAnnouncementDto>);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Invalidate cached data for this announcement and lists
    invalidateCache(`announcement:${announcement.slug}`);
    invalidateCache('announcements');
    invalidateCache('trending');
    invalidateCache('search');

    return res.json({ data: announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return res.status(500).json({ error: 'Failed to update announcement' });
  }
});



// Delete announcement (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid announcement ID' });
    }

    const deleted = await AnnouncementModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Invalidate cached data
    invalidateCache('announcements');
    invalidateCache('trending');
    invalidateCache('search');

    return res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

// Export announcements as CSV (admin only)
router.get('/export/csv', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const announcements = await AnnouncementModel.findAll({ limit: 1000 });

    // CSV headers
    const headers = ['ID', 'Title', 'Type', 'Category', 'Organization', 'Location', 'Total Posts', 'Deadline', 'External Link'];

    // Convert to CSV rows
    const rows = announcements.map(a => [
      a.id,
      `"${(a.title || '').replace(/"/g, '""')}"`,
      a.type,
      `"${(a.category || '').replace(/"/g, '""')}"`,
      `"${(a.organization || '').replace(/"/g, '""')}"`,
      `"${(a.location || '').replace(/"/g, '""')}"`,
      a.totalPosts || '',
      a.deadline || '',
      a.externalLink || ''
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="announcements-${new Date().toISOString().split('T')[0]}.csv"`);

    return res.send(csv);
  } catch (error) {
    console.error('Error exporting announcements:', error);
    return res.status(500).json({ error: 'Failed to export announcements' });
  }
});

export default router;
