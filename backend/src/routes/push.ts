import express from 'express';
import { z } from 'zod';
import { savePushSubscription, removePushSubscription, getVapidPublicKey } from '../services/push.js';

const router = express.Router();

// Validation schema for push subscription
const subscriptionSchema = z.object({
    endpoint: z.string().url(),
    keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
    }),
});

/**
 * GET /api/push/vapid-public-key
 * Get VAPID public key for frontend
 */
router.get('/vapid-public-key', (_req, res) => {
    return res.json({ publicKey: getVapidPublicKey() });
});

/**
 * POST /api/push/subscribe
 * Subscribe to push notifications
 */
router.post('/subscribe', async (req, res) => {
    try {
        const parseResult = subscriptionSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.flatten() });
        }

        const { endpoint, keys } = parseResult.data;
        const success = await savePushSubscription(endpoint, keys.p256dh, keys.auth);

        if (success) {
            return res.status(201).json({ message: 'Subscribed to push notifications' });
        } else {
            return res.status(500).json({ error: 'Failed to save subscription' });
        }
    } catch (error) {
        console.error('Error subscribing to push:', error);
        return res.status(500).json({ error: 'Failed to subscribe' });
    }
});

/**
 * POST /api/push/unsubscribe
 * Unsubscribe from push notifications
 */
router.post('/unsubscribe', async (req, res) => {
    try {
        const { endpoint } = req.body;
        if (!endpoint) {
            return res.status(400).json({ error: 'Endpoint required' });
        }

        await removePushSubscription(endpoint);
        return res.json({ message: 'Unsubscribed from push notifications' });
    } catch (error) {
        console.error('Error unsubscribing from push:', error);
        return res.status(500).json({ error: 'Failed to unsubscribe' });
    }
});

export default router;
