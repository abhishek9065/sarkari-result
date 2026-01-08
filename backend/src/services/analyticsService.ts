import { pool } from '../db.js';

interface DashboardStats {
    totalAnnouncements: number;
    totalUsers: number;
    totalViews: number;
    totalBookmarks: number;
    activeJobs: number;
    expiringSoon: number;
    newToday: number;
    newThisWeek: number;
}

interface CategoryStats {
    type: string;
    count: number;
    views: number;
}

interface TrendData {
    date: string;
    count: number;
    views: number;
}

interface TopContent {
    id: number;
    title: string;
    type: string;
    views: number;
    organization: string;
}

interface UserStats {
    totalUsers: number;
    newToday: number;
    newThisWeek: number;
    activeSubscribers: number;
}

export class AnalyticsService {
    /**
     * Get dashboard overview statistics
     */
    static async getDashboardStats(): Promise<DashboardStats> {
        try {
            const [
                announcementsResult,
                usersResult,
                viewsResult,
                bookmarksResult,
                activeJobsResult,
                expiringResult,
                newTodayResult,
                newWeekResult
            ] = await Promise.all([
                pool.query('SELECT COUNT(*) FROM announcements WHERE is_active = true'),
                pool.query('SELECT COUNT(*) FROM users'),
                pool.query('SELECT COALESCE(SUM(view_count), 0) as total FROM announcements'),
                pool.query('SELECT COUNT(*) FROM bookmarks'),
                pool.query(`SELECT COUNT(*) FROM announcements WHERE is_active = true AND type = 'job' AND (deadline IS NULL OR deadline >= CURRENT_DATE)`),
                pool.query(`SELECT COUNT(*) FROM announcements WHERE deadline BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`),
                pool.query(`SELECT COUNT(*) FROM announcements WHERE DATE(posted_at) = CURRENT_DATE`),
                pool.query(`SELECT COUNT(*) FROM announcements WHERE posted_at >= NOW() - INTERVAL '7 days'`)
            ]);

            return {
                totalAnnouncements: parseInt(announcementsResult.rows[0].count),
                totalUsers: parseInt(usersResult.rows[0].count),
                totalViews: parseInt(viewsResult.rows[0].total),
                totalBookmarks: parseInt(bookmarksResult.rows[0].count),
                activeJobs: parseInt(activeJobsResult.rows[0].count),
                expiringSoon: parseInt(expiringResult.rows[0].count),
                newToday: parseInt(newTodayResult.rows[0].count),
                newThisWeek: parseInt(newWeekResult.rows[0].count)
            };
        } catch (error) {
            console.error('[Analytics] Error getting dashboard stats:', error);
            return {
                totalAnnouncements: 0,
                totalUsers: 0,
                totalViews: 0,
                totalBookmarks: 0,
                activeJobs: 0,
                expiringSoon: 0,
                newToday: 0,
                newThisWeek: 0
            };
        }
    }

    /**
     * Get statistics by category/type
     */
    static async getCategoryStats(): Promise<CategoryStats[]> {
        try {
            const result = await pool.query(`
                SELECT 
                    type,
                    COUNT(*) as count,
                    COALESCE(SUM(view_count), 0) as views
                FROM announcements
                WHERE is_active = true
                GROUP BY type
                ORDER BY count DESC
            `);
            return result.rows;
        } catch (error) {
            console.error('[Analytics] Error getting category stats:', error);
            return [];
        }
    }

    /**
     * Get posting trends over time (last 30 days)
     */
    static async getPostingTrends(days: number = 30): Promise<TrendData[]> {
        try {
            const result = await pool.query(`
                SELECT 
                    DATE(posted_at) as date,
                    COUNT(*) as count,
                    COALESCE(SUM(view_count), 0) as views
                FROM announcements
                WHERE posted_at >= NOW() - INTERVAL '${days} days'
                GROUP BY DATE(posted_at)
                ORDER BY date ASC
            `);
            return result.rows.map(row => ({
                date: row.date.toISOString().split('T')[0],
                count: parseInt(row.count),
                views: parseInt(row.views)
            }));
        } catch (error) {
            console.error('[Analytics] Error getting posting trends:', error);
            return [];
        }
    }

    /**
     * Get top performing content
     */
    static async getTopContent(limit: number = 10): Promise<TopContent[]> {
        try {
            const result = await pool.query(`
                SELECT 
                    id,
                    title,
                    type,
                    view_count as views,
                    organization
                FROM announcements
                WHERE is_active = true
                ORDER BY view_count DESC
                LIMIT $1
            `, [limit]);
            return result.rows;
        } catch (error) {
            console.error('[Analytics] Error getting top content:', error);
            return [];
        }
    }

    /**
     * Get user statistics
     */
    static async getUserStats(): Promise<UserStats> {
        try {
            const [totalResult, todayResult, weekResult, subscribersResult] = await Promise.all([
                pool.query('SELECT COUNT(*) FROM users'),
                pool.query(`SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE`),
                pool.query(`SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days'`),
                pool.query(`SELECT COUNT(*) FROM email_subscriptions WHERE is_verified = true`)
            ]);

            return {
                totalUsers: parseInt(totalResult.rows[0].count),
                newToday: parseInt(todayResult.rows[0].count),
                newThisWeek: parseInt(weekResult.rows[0].count),
                activeSubscribers: parseInt(subscribersResult.rows[0].count)
            };
        } catch (error) {
            console.error('[Analytics] Error getting user stats:', error);
            return { totalUsers: 0, newToday: 0, newThisWeek: 0, activeSubscribers: 0 };
        }
    }

    /**
     * Get recent activity log
     */
    static async getRecentActivity(limit: number = 20): Promise<any[]> {
        try {
            const result = await pool.query(`
                SELECT 
                    'announcement' as type,
                    id,
                    title as description,
                    posted_at as timestamp
                FROM announcements
                ORDER BY posted_at DESC
                LIMIT $1
            `, [limit]);
            return result.rows;
        } catch (error) {
            console.error('[Analytics] Error getting recent activity:', error);
            return [];
        }
    }

    /**
     * Track an analytics event
     */
    static async trackEvent(
        eventType: string,
        userId?: number,
        announcementId?: number,
        metadata?: Record<string, any>
    ): Promise<void> {
        try {
            await pool.query(`
                INSERT INTO analytics_events (event_type, user_id, announcement_id, metadata)
                VALUES ($1, $2, $3, $4)
            `, [eventType, userId || null, announcementId || null, JSON.stringify(metadata || {})]);
        } catch (error) {
            console.error('[Analytics] Error tracking event:', error);
        }
    }

    /**
     * Get event counts by type
     */
    static async getEventCounts(since?: Date): Promise<Record<string, number>> {
        try {
            let query = `
                SELECT event_type, COUNT(*) as count
                FROM analytics_events
            `;
            const params: any[] = [];

            if (since) {
                query += ` WHERE created_at >= $1`;
                params.push(since);
            }

            query += ` GROUP BY event_type`;

            const result = await pool.query(query, params);
            return result.rows.reduce((acc, row) => {
                acc[row.event_type] = parseInt(row.count);
                return acc;
            }, {} as Record<string, number>);
        } catch (error) {
            console.error('[Analytics] Error getting event counts:', error);
            return {};
        }
    }
}

export default AnalyticsService;
