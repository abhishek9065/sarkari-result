import express from 'express';
import { z } from 'zod';
import { SubscriptionModel } from '../models/subscriptions.js';
import { sendVerificationEmail, isEmailConfigured } from '../services/email.js';

const router = express.Router();

// Validation schemas
const subscribeSchema = z.object({
    email: z.string().email('Invalid email address'),
    categories: z.array(z.string()).optional().default([]),
});

/**
 * POST /api/subscriptions
 * Subscribe to email notifications
 */
router.post('/', async (req, res) => {
    try {
        const parseResult = subscribeSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.flatten() });
        }

        const { email, categories } = parseResult.data;

        // Check if email service is configured
        if (!isEmailConfigured()) {
            return res.status(503).json({
                error: 'Email service not configured. Please try again later.'
            });
        }

        // Create subscription
        const subscription = await SubscriptionModel.create(email, categories);
        if (!subscription) {
            return res.status(500).json({ error: 'Failed to create subscription' });
        }

        // Send verification email
        if (subscription.verificationToken) {
            const sent = await sendVerificationEmail(
                email,
                subscription.verificationToken,
                categories
            );

            if (!sent) {
                return res.status(500).json({
                    error: 'Failed to send verification email. Please try again.'
                });
            }
        }

        return res.status(201).json({
            message: 'Subscription created. Please check your email to verify.',
            data: { email, categories },
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        return res.status(500).json({ error: 'Failed to process subscription' });
    }
});

/**
 * GET /api/subscriptions/verify/:token
 * Verify email subscription
 */
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const subscription = await SubscriptionModel.verify(token);
        if (!subscription) {
            return res.status(400).json({
                error: 'Invalid or expired verification link'
            });
        }

        return res.json({
            message: 'Email verified successfully! You will now receive notifications.',
            data: { email: subscription.email, categories: subscription.categories },
        });
    } catch (error) {
        console.error('Error verifying subscription:', error);
        return res.status(500).json({ error: 'Failed to verify subscription' });
    }
});

/**
 * GET /api/subscriptions/unsubscribe/:token
 * Unsubscribe from email notifications
 */
router.get('/unsubscribe/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const success = await SubscriptionModel.unsubscribe(token);
        if (!success) {
            return res.status(400).json({
                error: 'Invalid or expired unsubscribe link'
            });
        }

        return res.json({
            message: 'You have been unsubscribed from email notifications.',
        });
    } catch (error) {
        console.error('Error unsubscribing:', error);
        return res.status(500).json({ error: 'Failed to unsubscribe' });
    }
});

/**
 * GET /api/subscriptions/status
 * Check subscription status by email
 */
router.get('/status/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const subscription = await SubscriptionModel.findByEmail(email);
        if (!subscription) {
            return res.json({ subscribed: false });
        }

        return res.json({
            subscribed: true,
            verified: subscription.isVerified,
            categories: subscription.categories,
        });
    } catch (error) {
        console.error('Error checking subscription status:', error);
        return res.status(500).json({ error: 'Failed to check status' });
    }
});

export default router;
