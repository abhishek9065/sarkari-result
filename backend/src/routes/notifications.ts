import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { pool } from '../db.js';
import { EmailService } from '../services/emailService.js';

const router = Router();

// Validation schemas
const subscribeSchema = z.object({
    email: z.string().email(),
    categories: z.array(z.string()).optional(),
    frequency: z.enum(['instant', 'daily', 'weekly']).default('daily')
});

const verifySchema = z.object({
    token: z.string().min(32)
});

/**
 * POST /api/notifications/subscribe
 * Subscribe to email notifications
 */
router.post('/subscribe', async (req, res) => {
    try {
        const validation = subscribeSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid data',
                details: validation.error.errors
            });
        }

        const { email, categories, frequency } = validation.data;

        // Generate tokens
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const unsubscribeToken = crypto.randomBytes(32).toString('hex');

        // Check if already subscribed
        const existing = await pool.query(
            'SELECT * FROM email_subscriptions WHERE email = $1',
            [email]
        );

        if (existing.rows.length > 0) {
            if (existing.rows[0].is_verified) {
                return res.status(400).json({ error: 'Email already subscribed' });
            }
            // Update verification token for unverified subscription
            await pool.query(
                `UPDATE email_subscriptions 
                SET verification_token = $1, categories = $2
                WHERE email = $3`,
                [verificationToken, categories || [], email]
            );
        } else {
            // Create new subscription
            await pool.query(
                `INSERT INTO email_subscriptions 
                (email, categories, verification_token, unsubscribe_token, is_verified)
                VALUES ($1, $2, $3, $4, false)`,
                [email, categories || [], verificationToken, unsubscribeToken]
            );
        }

        // Send verification email (if email service configured)
        if (EmailService.isConfigured()) {
            // TODO: Send verification email
            console.log(`[Notifications] Verification email should be sent to ${email}`);
        }

        return res.json({
            message: 'Subscription created. Please check your email for verification.',
            verified: false
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        return res.status(500).json({ error: 'Failed to subscribe' });
    }
});

/**
 * POST /api/notifications/verify
 * Verify email subscription
 */
router.post('/verify', async (req, res) => {
    try {
        const validation = verifySchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: 'Invalid token' });
        }

        const { token } = validation.data;

        const result = await pool.query(
            `UPDATE email_subscriptions 
            SET is_verified = true, verification_token = NULL
            WHERE verification_token = $1
            RETURNING email`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invalid or expired token' });
        }

        return res.json({
            message: 'Email verified successfully',
            email: result.rows[0].email
        });
    } catch (error) {
        console.error('Verify error:', error);
        return res.status(500).json({ error: 'Failed to verify' });
    }
});

/**
 * POST /api/notifications/unsubscribe
 * Unsubscribe from email notifications
 */
router.post('/unsubscribe', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token || typeof token !== 'string') {
            return res.status(400).json({ error: 'Invalid token' });
        }

        const result = await pool.query(
            `DELETE FROM email_subscriptions 
            WHERE unsubscribe_token = $1
            RETURNING email`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        return res.json({
            message: 'Successfully unsubscribed',
            email: result.rows[0].email
        });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return res.status(500).json({ error: 'Failed to unsubscribe' });
    }
});

/**
 * GET /api/notifications/status
 * Check subscription status by email
 */
router.get('/status', async (req, res) => {
    try {
        const email = req.query.email as string;

        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }

        const result = await pool.query(
            `SELECT is_verified, categories FROM email_subscriptions WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.json({ subscribed: false });
        }

        return res.json({
            subscribed: true,
            verified: result.rows[0].is_verified,
            categories: result.rows[0].categories
        });
    } catch (error) {
        console.error('Status error:', error);
        return res.status(500).json({ error: 'Failed to check status' });
    }
});

export default router;
