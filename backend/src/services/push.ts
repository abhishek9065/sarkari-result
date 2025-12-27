import webpush from 'web-push';
import { pool } from '../db.js';
import { config } from '../config.js';
import { Announcement } from '../types.js';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
    'mailto:admin@sarkariresult.com',
    config.vapidPublicKey,
    config.vapidPrivateKey
);

export interface PushSubscription {
    id: number;
    endpoint: string;
    p256dh: string;
    auth: string;
    createdAt: Date;
}

/**
 * Check if push notifications are configured
 */
export const isPushConfigured = (): boolean => {
    return !!(config.vapidPublicKey && config.vapidPrivateKey);
};

/**
 * Get VAPID public key for frontend
 */
export const getVapidPublicKey = (): string => {
    return config.vapidPublicKey;
};

/**
 * Save a push subscription
 */
export const savePushSubscription = async (
    endpoint: string,
    p256dh: string,
    auth: string
): Promise<boolean> => {
    try {
        await pool.query(
            `INSERT INTO push_subscriptions (endpoint, p256dh, auth)
             VALUES ($1, $2, $3)
             ON CONFLICT (endpoint) DO UPDATE SET
               p256dh = $2,
               auth = $3,
               updated_at = CURRENT_TIMESTAMP`,
            [endpoint, p256dh, auth]
        );
        console.log('Push subscription saved');
        return true;
    } catch (error) {
        console.error('Error saving push subscription:', error);
        return false;
    }
};

/**
 * Remove a push subscription
 */
export const removePushSubscription = async (endpoint: string): Promise<boolean> => {
    try {
        await pool.query(
            `DELETE FROM push_subscriptions WHERE endpoint = $1`,
            [endpoint]
        );
        return true;
    } catch (error) {
        console.error('Error removing push subscription:', error);
        return false;
    }
};

/**
 * Get all push subscriptions
 */
export const getAllPushSubscriptions = async (): Promise<PushSubscription[]> => {
    try {
        const result = await pool.query(
            `SELECT id, endpoint, p256dh, auth, created_at FROM push_subscriptions`
        );
        return result.rows.map(row => ({
            id: row.id,
            endpoint: row.endpoint,
            p256dh: row.p256dh,
            auth: row.auth,
            createdAt: row.created_at,
        }));
    } catch (error) {
        console.error('Error getting push subscriptions:', error);
        return [];
    }
};

/**
 * Send push notification to all subscribers
 */
export const sendPushNotification = async (
    announcement: Announcement
): Promise<number> => {
    if (!isPushConfigured()) {
        console.log('Push notifications not configured');
        return 0;
    }

    const subscriptions = await getAllPushSubscriptions();
    if (subscriptions.length === 0) {
        return 0;
    }

    // Base URL for absolute paths
    const baseUrl = config.frontendUrl || 'https://sarkari-result-gold.vercel.app';

    // Rich notification payload with logo and enhanced options
    const payload = JSON.stringify({
        title: `Sarkari Result`,
        body: `${announcement.title} - ${announcement.organization} ${announcement.totalPosts ? `(${announcement.totalPosts} पद)` : ''}`,
        icon: `${baseUrl}/icons/icon-192x192.png`,
        badge: `${baseUrl}/icons/icon-72x72.png`,
        image: `${baseUrl}/og-image.png`,
        tag: `sarkari-${announcement.type}-${announcement.id}`,
        requireInteraction: true,
        renotify: false,
        vibrate: [200, 100, 200],
        actions: [
            { action: 'view', title: '🔍 View Details' },
            { action: 'dismiss', title: '❌ Dismiss' }
        ],
        data: {
            url: `${baseUrl}/?item=${announcement.slug}`,
            type: announcement.type,
            id: announcement.id,
            timestamp: Date.now()
        },
    });

    let sentCount = 0;
    const failedEndpoints: string[] = [];

    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                },
                payload
            );
            sentCount++;
        } catch (error: any) {
            console.error(`Failed to send push to ${sub.endpoint}:`, error.message);
            // If subscription is expired or invalid, mark for removal
            if (error.statusCode === 410 || error.statusCode === 404) {
                failedEndpoints.push(sub.endpoint);
            }
        }
    }

    // Clean up invalid subscriptions
    for (const endpoint of failedEndpoints) {
        await removePushSubscription(endpoint);
    }

    console.log(`Sent ${sentCount}/${subscriptions.length} push notifications`);
    return sentCount;
};
