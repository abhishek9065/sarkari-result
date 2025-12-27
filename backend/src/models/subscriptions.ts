import crypto from 'crypto';
import { pool } from '../db.js';

export interface EmailSubscription {
    id: number;
    email: string;
    categories: string[];
    verificationToken: string | null;
    isVerified: boolean;
    unsubscribeToken: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Generate a random token for verification/unsubscribe
 */
const generateToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

export const SubscriptionModel = {
    /**
     * Create a new email subscription
     */
    async create(email: string, categories: string[]): Promise<EmailSubscription | null> {
        const verificationToken = generateToken();
        const unsubscribeToken = generateToken();

        try {
            const result = await pool.query(
                `INSERT INTO email_subscriptions (email, categories, verification_token, unsubscribe_token)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET
           categories = $2,
           verification_token = $3,
           is_verified = false,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
                [email, categories, verificationToken, unsubscribeToken]
            );
            return mapSubscription(result.rows[0]);
        } catch (error) {
            console.error('Error creating subscription:', error);
            return null;
        }
    },

    /**
     * Verify an email subscription
     */
    async verify(verificationToken: string): Promise<EmailSubscription | null> {
        try {
            const result = await pool.query(
                `UPDATE email_subscriptions
         SET is_verified = true, verification_token = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE verification_token = $1
         RETURNING *`,
                [verificationToken]
            );
            return result.rows[0] ? mapSubscription(result.rows[0]) : null;
        } catch (error) {
            console.error('Error verifying subscription:', error);
            return null;
        }
    },

    /**
     * Unsubscribe by token
     */
    async unsubscribe(unsubscribeToken: string): Promise<boolean> {
        try {
            const result = await pool.query(
                `DELETE FROM email_subscriptions WHERE unsubscribe_token = $1 RETURNING id`,
                [unsubscribeToken]
            );
            return result.rowCount !== null && result.rowCount > 0;
        } catch (error) {
            console.error('Error unsubscribing:', error);
            return false;
        }
    },

    /**
     * Find subscription by email
     */
    async findByEmail(email: string): Promise<EmailSubscription | null> {
        try {
            const result = await pool.query(
                `SELECT * FROM email_subscriptions WHERE email = $1`,
                [email]
            );
            return result.rows[0] ? mapSubscription(result.rows[0]) : null;
        } catch (error) {
            console.error('Error finding subscription:', error);
            return null;
        }
    },

    /**
     * Get all verified subscribers for a category
     */
    async getSubscribersForCategory(category: string): Promise<{ email: string; unsubscribeToken: string }[]> {
        try {
            const result = await pool.query(
                `SELECT email, unsubscribe_token
         FROM email_subscriptions
         WHERE is_verified = true
         AND ($1 = ANY(categories) OR cardinality(categories) = 0)`,
                [category]
            );
            return result.rows.map(row => ({
                email: row.email,
                unsubscribeToken: row.unsubscribe_token,
            }));
        } catch (error) {
            console.error('Error getting subscribers:', error);
            return [];
        }
    },

    /**
     * Get all verified subscribers count
     */
    async getSubscriberCount(): Promise<number> {
        try {
            const result = await pool.query(
                `SELECT COUNT(*) FROM email_subscriptions WHERE is_verified = true`
            );
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error('Error getting subscriber count:', error);
            return 0;
        }
    },
};

/**
 * Map database row to EmailSubscription object
 */
function mapSubscription(row: any): EmailSubscription {
    return {
        id: row.id,
        email: row.email,
        categories: row.categories || [],
        verificationToken: row.verification_token,
        isVerified: row.is_verified,
        unsubscribeToken: row.unsubscribe_token,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
