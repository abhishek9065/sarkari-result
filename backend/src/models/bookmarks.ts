import { pool } from '../db.js';
import { Announcement } from '../types.js';

export interface Bookmark {
    id: number;
    userId: number;
    announcementId: number;
    createdAt: Date;
}

export class BookmarkModel {
    static async create(userId: number, announcementId: number): Promise<Bookmark> {
        const result = await pool.query<Bookmark>(
            `INSERT INTO bookmarks (user_id, announcement_id) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, announcement_id) DO UPDATE SET user_id = $1
       RETURNING id, user_id as "userId", announcement_id as "announcementId", created_at as "createdAt"`,
            [userId, announcementId]
        );
        return result.rows[0];
    }

    static async delete(userId: number, announcementId: number): Promise<boolean> {
        const result = await pool.query(
            `DELETE FROM bookmarks WHERE user_id = $1 AND announcement_id = $2`,
            [userId, announcementId]
        );
        return (result.rowCount ?? 0) > 0;
    }

    static async findByUser(userId: number): Promise<Announcement[]> {
        const result = await pool.query(
            `SELECT a.id, a.title, a.slug, a.type, a.category, a.organization,
              a.content, a.external_link as "externalLink", a.location,
              a.deadline, a.min_qualification as "minQualification",
              a.age_limit as "ageLimit", a.application_fee as "applicationFee",
              a.total_posts as "totalPosts", a.posted_at as "postedAt",
              a.updated_at as "updatedAt", a.is_active as "isActive",
              a.view_count as "viewCount"
       FROM announcements a
       INNER JOIN bookmarks b ON a.id = b.announcement_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    static async exists(userId: number, announcementId: number): Promise<boolean> {
        const result = await pool.query(
            `SELECT 1 FROM bookmarks WHERE user_id = $1 AND announcement_id = $2`,
            [userId, announcementId]
        );
        return result.rows.length > 0;
    }

    static async getBookmarkedIds(userId: number): Promise<number[]> {
        const result = await pool.query(
            `SELECT announcement_id as "announcementId" FROM bookmarks WHERE user_id = $1`,
            [userId]
        );
        return result.rows.map(row => row.announcementId);
    }
}
