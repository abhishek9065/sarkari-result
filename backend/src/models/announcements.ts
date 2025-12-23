import { pool } from '../db.js';
import { Announcement, ContentType, CreateAnnouncementDto, Tag, ImportantDate } from '../types.js';
import { filterMockAnnouncements, findMockBySlug, mockAnnouncements } from './mockData.js';

// Always try database first on each request

export class AnnouncementModel {
  static async findAll(filters?: {
    type?: ContentType;
    search?: string;
    category?: string;
    organization?: string;
    limit?: number;
    offset?: number;
  }): Promise<Announcement[]> {
    // Always try database connection on each request

    try {
      let query = `
        SELECT 
          a.id, a.title, a.slug, a.type, a.category, a.organization, a.content,
          a.external_link as "externalLink", 
          a.location, a.deadline, 
          a.min_qualification as "minQualification",
          a.age_limit as "ageLimit", 
          a.application_fee as "applicationFee",
          a.total_posts as "totalPosts", 
          a.posted_by as "postedBy",
          a.posted_at as "postedAt", 
          a.updated_at as "updatedAt",
          a.is_active as "isActive", 
          a.view_count as "viewCount",
          COALESCE(json_agg(DISTINCT jsonb_build_object(
            'id', t.id,
            'name', t.name,
            'slug', t.slug
          )) FILTER (WHERE t.id IS NOT NULL), '[]') as tags
        FROM announcements a
        LEFT JOIN announcement_tags at ON a.id = at.announcement_id
        LEFT JOIN tags t ON at.tag_id = t.id
        WHERE a.is_active = true
      `;

      const params: any[] = [];
      let paramCount = 0;

      if (filters?.type) {
        query += ` AND a.type = $${++paramCount}`;
        params.push(filters.type);
      }

      if (filters?.category) {
        query += ` AND a.category = $${++paramCount}`;
        params.push(filters.category);
      }

      if (filters?.organization) {
        query += ` AND a.organization = $${++paramCount}`;
        params.push(filters.organization);
      }

      if (filters?.search) {
        // Use full text search index defined in schema.sql for better performance
        query += ` AND (to_tsvector('english', a.title || ' ' || COALESCE(a.content, '') || ' ' || a.organization || ' ' || a.category) @@ plainto_tsquery('english', $${++paramCount})
          OR EXISTS (
            SELECT 1 FROM tags t2 
            JOIN announcement_tags at2 ON t2.id = at2.tag_id 
            WHERE at2.announcement_id = a.id AND t2.name ILIKE $${++paramCount}
          ))`;
        params.push(filters.search);
        params.push(`%${filters.search}%`);
      }

      query += ` GROUP BY a.id ORDER BY a.posted_at DESC`;

      if (filters?.limit) {
        query += ` LIMIT $${++paramCount}`;
        params.push(filters.limit);
      }

      if (filters?.offset) {
        query += ` OFFSET $${++paramCount}`;
        params.push(filters.offset);
      }

      const result = await pool.query<Announcement>(query, params);
      return result.rows;
    } catch (error) {
      console.error('[DB Error] Falling back to mock data:', (error as Error).message);
      return filterMockAnnouncements(filters);
    }
  }

  static async findBySlug(slug: string): Promise<Announcement | null> {
    // Always try database first

    try {
      const query = `
        SELECT 
          a.id, a.title, a.slug, a.type, a.category, a.organization, a.content,
          a.external_link as "externalLink", 
          a.location, a.deadline, 
          a.min_qualification as "minQualification",
          a.age_limit as "ageLimit", 
          a.application_fee as "applicationFee",
          a.total_posts as "totalPosts", 
          a.posted_by as "postedBy",
          a.posted_at as "postedAt", 
          a.updated_at as "updatedAt",
          a.is_active as "isActive", 
          a.view_count as "viewCount",
          COALESCE(json_agg(DISTINCT jsonb_build_object(
            'id', t.id,
            'name', t.name,
            'slug', t.slug
          )) FILTER (WHERE t.id IS NOT NULL), '[]') as tags,
          COALESCE(json_agg(DISTINCT jsonb_build_object(
            'id', id.id,
            'eventName', id.event_name,
            'eventDate', id.event_date,
            'description', id.description
          )) FILTER (WHERE id.id IS NOT NULL), '[]') as important_dates
        FROM announcements a
        LEFT JOIN announcement_tags at ON a.id = at.announcement_id
        LEFT JOIN tags t ON at.tag_id = t.id
        LEFT JOIN important_dates id ON a.id = id.announcement_id
        WHERE a.slug = $1 AND a.is_active = true
        GROUP BY a.id
      `;

      const result = await pool.query<Announcement>(query, [slug]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('[DB Error] Falling back to mock data for slug:', slug);
      return findMockBySlug(slug);
    }
  }

  static async create(data: CreateAnnouncementDto, userId: number): Promise<Announcement> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Generate slug
      const slug = this.generateSlug(data.title);

      // Insert announcement
      const insertQuery = `
        INSERT INTO announcements (
          title, slug, type, category, organization, content,
          external_link, location, deadline, min_qualification,
          age_limit, application_fee, total_posts, posted_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;

      const values = [
        data.title,
        slug,
        data.type,
        data.category,
        data.organization,
        data.content || null,
        data.externalLink?.trim() || null,
        data.location || null,
        data.deadline?.trim() || null,
        data.minQualification || null,
        data.ageLimit || null,
        data.applicationFee?.trim() || null,
        data.totalPosts || null,
        userId
      ];

      const result = await client.query<Announcement>(insertQuery, values);
      const announcement = result.rows[0];

      // Insert tags if provided
      if (data.tags && data.tags.length > 0) {
        for (const tagName of data.tags) {
          // Insert or get existing tag
          const tagSlug = this.generateSlug(tagName);
          const tagResult = await client.query<Tag>(
            `INSERT INTO tags (name, slug) VALUES ($1, $2) 
             ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name 
             RETURNING id`,
            [tagName, tagSlug]
          );

          // Link tag to announcement
          await client.query(
            `INSERT INTO announcement_tags (announcement_id, tag_id) VALUES ($1, $2)`,
            [announcement.id, tagResult.rows[0].id]
          );
        }
      }

      // Insert important dates if provided
      if (data.importantDates && data.importantDates.length > 0) {
        for (const date of data.importantDates) {
          await client.query(
            `INSERT INTO important_dates (announcement_id, event_name, event_date, description)
             VALUES ($1, $2, $3, $4)`,
            [announcement.id, date.eventName, date.eventDate, date.description || null]
          );
        }
      }

      await client.query('COMMIT');

      // Return complete announcement with tags
      const completeAnnouncement = await this.findBySlug(slug);
      return completeAnnouncement!;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async update(id: number, data: Partial<CreateAnnouncementDto>): Promise<Announcement | null> {
    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    const allowedFields = [
      'title', 'type', 'category', 'organization', 'content',
      'external_link', 'location', 'deadline', 'min_qualification',
      'age_limit', 'application_fee', 'total_posts', 'is_active'
    ];

    for (const [key, value] of Object.entries(data)) {
      const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbField)) {
        updateFields.push(`${dbField} = $${++paramCount}`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return null;
    }

    values.push(id);
    const query = `
      UPDATE announcements 
      SET ${updateFields.join(', ')} 
      WHERE id = $${++paramCount} 
      RETURNING slug
    `;

    const result = await pool.query<{ slug: string }>(query, values);
    if (result.rows.length === 0) return null;
    return this.findBySlug(result.rows[0].slug);
  }

  static async incrementViewCount(id: number): Promise<void> {
    await pool.query('UPDATE announcements SET view_count = view_count + 1 WHERE id = $1', [id]);
  }

  static async getCategories(): Promise<string[]> {
    const result = await pool.query<{ category: string }>(
      'SELECT DISTINCT category FROM announcements WHERE is_active = true ORDER BY category'
    );
    return result.rows.map(row => row.category);
  }

  static async getOrganizations(): Promise<string[]> {
    const result = await pool.query<{ organization: string }>(
      'SELECT DISTINCT organization FROM announcements WHERE is_active = true ORDER BY organization'
    );
    return result.rows.map(row => row.organization);
  }

  private static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 200) + '-' + Date.now();
  }
}