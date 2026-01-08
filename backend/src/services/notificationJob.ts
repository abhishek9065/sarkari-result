import { pool } from '../db.js';
import { EmailService } from './emailService.js';
import { UserProfileModel } from '../models/userProfiles.js';
import { Announcement } from '../types.js';

interface NotificationSubscriber {
    userId: number;
    email: string;
    preferredCategories: string[];
    notificationFrequency: 'instant' | 'daily' | 'weekly';
    unsubscribeToken: string;
}

/**
 * Get subscribers who should receive notifications
 */
async function getSubscribers(frequency: 'instant' | 'daily' | 'weekly'): Promise<NotificationSubscriber[]> {
    try {
        const result = await pool.query(`
            SELECT 
                u.id as "userId",
                u.email,
                up.preferred_categories as "preferredCategories",
                up.notification_frequency as "notificationFrequency",
                es.unsubscribe_token as "unsubscribeToken"
            FROM user_profiles up
            JOIN users u ON u.id = up.user_id
            LEFT JOIN email_subscriptions es ON es.email = u.email AND es.is_verified = true
            WHERE up.email_notifications = true
              AND up.notification_frequency = $1
              AND es.unsubscribe_token IS NOT NULL
        `, [frequency]);

        return result.rows;
    } catch (error) {
        console.error('[NotificationJob] Error getting subscribers:', error);
        return [];
    }
}

/**
 * Get new announcements since last notification
 */
async function getNewAnnouncements(since: Date, categories?: string[]): Promise<Announcement[]> {
    try {
        let query = `
            SELECT 
                id, title, slug, type, category, organization,
                external_link as "externalLink", location, deadline,
                min_qualification as "minQualification", 
                total_posts as "totalPosts", 
                posted_at as "postedAt"
            FROM announcements
            WHERE is_active = true
              AND posted_at > $1
        `;

        const params: any[] = [since];

        if (categories && categories.length > 0) {
            query += ` AND category = ANY($2)`;
            params.push(categories);
        }

        query += ` ORDER BY posted_at DESC LIMIT 20`;

        const result = await pool.query(query, params);
        return result.rows;
    } catch (error) {
        console.error('[NotificationJob] Error getting announcements:', error);
        return [];
    }
}

/**
 * Track last notification time to avoid duplicates
 */
async function getLastNotificationTime(type: 'daily' | 'weekly'): Promise<Date> {
    // For daily: 24 hours ago, for weekly: 7 days ago
    const hoursAgo = type === 'daily' ? 24 : 168;
    return new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
}

/**
 * Send daily digest to all daily subscribers
 */
export async function sendDailyDigests(): Promise<void> {
    if (!EmailService.isConfigured()) {
        console.log('[NotificationJob] Email not configured, skipping daily digests');
        return;
    }

    console.log('[NotificationJob] Starting daily digest job');

    const subscribers = await getSubscribers('daily');
    if (subscribers.length === 0) {
        console.log('[NotificationJob] No daily subscribers found');
        return;
    }

    const since = await getLastNotificationTime('daily');
    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
        // Get announcements matching subscriber's preferences
        const jobs = await getNewAnnouncements(
            since,
            subscriber.preferredCategories?.length > 0 ? subscriber.preferredCategories : undefined
        );

        if (jobs.length === 0) continue;

        const success = await EmailService.sendDigest({
            to: subscriber.email,
            jobs,
            type: 'daily',
            unsubscribeToken: subscriber.unsubscribeToken || 'default'
        });

        if (success) sent++;
        else failed++;

        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[NotificationJob] Daily digest complete: ${sent} sent, ${failed} failed`);
}

/**
 * Send weekly digest to all weekly subscribers
 */
export async function sendWeeklyDigests(): Promise<void> {
    if (!EmailService.isConfigured()) {
        console.log('[NotificationJob] Email not configured, skipping weekly digests');
        return;
    }

    console.log('[NotificationJob] Starting weekly digest job');

    const subscribers = await getSubscribers('weekly');
    if (subscribers.length === 0) {
        console.log('[NotificationJob] No weekly subscribers found');
        return;
    }

    const since = await getLastNotificationTime('weekly');
    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
        const jobs = await getNewAnnouncements(
            since,
            subscriber.preferredCategories?.length > 0 ? subscriber.preferredCategories : undefined
        );

        if (jobs.length === 0) continue;

        const success = await EmailService.sendDigest({
            to: subscriber.email,
            jobs,
            type: 'weekly',
            unsubscribeToken: subscriber.unsubscribeToken || 'default'
        });

        if (success) sent++;
        else failed++;

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[NotificationJob] Weekly digest complete: ${sent} sent, ${failed} failed`);
}

/**
 * Send instant alerts for a new announcement
 */
export async function sendInstantAlerts(announcement: Announcement): Promise<void> {
    if (!EmailService.isConfigured()) {
        console.log('[NotificationJob] Email not configured, skipping instant alerts');
        return;
    }

    console.log(`[NotificationJob] Sending instant alerts for: ${announcement.title}`);

    const subscribers = await getSubscribers('instant');
    if (subscribers.length === 0) {
        console.log('[NotificationJob] No instant subscribers found');
        return;
    }

    // Filter subscribers by category preference
    const matchingSubscribers = subscribers.filter(sub => {
        if (!sub.preferredCategories || sub.preferredCategories.length === 0) return true;
        return sub.preferredCategories.includes(announcement.category);
    });

    let sent = 0;
    let failed = 0;

    for (const subscriber of matchingSubscribers) {
        const success = await EmailService.sendJobAlert({
            to: subscriber.email,
            subject: `🔔 New ${announcement.type}: ${announcement.title}`,
            jobs: [announcement],
            unsubscribeToken: subscriber.unsubscribeToken || 'default'
        });

        if (success) sent++;
        else failed++;

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[NotificationJob] Instant alerts complete: ${sent} sent, ${failed} failed`);
}

/**
 * Schedule notification jobs (call this in server startup)
 */
export function scheduleNotificationJobs(): void {
    if (!EmailService.isConfigured()) {
        console.log('[NotificationJob] Email not configured, notification jobs disabled');
        return;
    }

    console.log('[NotificationJob] Scheduling notification jobs');

    // Daily digest at 8 AM IST
    const now = new Date();
    const nextDaily = new Date();
    nextDaily.setHours(8, 0, 0, 0);
    if (nextDaily <= now) {
        nextDaily.setDate(nextDaily.getDate() + 1);
    }
    const dailyDelay = nextDaily.getTime() - now.getTime();

    setTimeout(() => {
        sendDailyDigests();
        // Then repeat every 24 hours
        setInterval(sendDailyDigests, 24 * 60 * 60 * 1000);
    }, dailyDelay);

    // Weekly digest on Sunday at 10 AM IST
    const nextWeekly = new Date();
    const daysUntilSunday = (7 - nextWeekly.getDay()) % 7 || 7;
    nextWeekly.setDate(nextWeekly.getDate() + daysUntilSunday);
    nextWeekly.setHours(10, 0, 0, 0);
    if (nextWeekly <= now) {
        nextWeekly.setDate(nextWeekly.getDate() + 7);
    }
    const weeklyDelay = nextWeekly.getTime() - now.getTime();

    setTimeout(() => {
        sendWeeklyDigests();
        // Then repeat every 7 days
        setInterval(sendWeeklyDigests, 7 * 24 * 60 * 60 * 1000);
    }, weeklyDelay);

    console.log(`[NotificationJob] Daily digest scheduled for ${nextDaily.toLocaleString()}`);
    console.log(`[NotificationJob] Weekly digest scheduled for ${nextWeekly.toLocaleString()}`);
}

export default {
    sendDailyDigests,
    sendWeeklyDigests,
    sendInstantAlerts,
    scheduleNotificationJobs
};
