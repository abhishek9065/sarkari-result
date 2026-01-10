import { ObjectId, Filter, Sort, WithId, Document } from 'mongodb';
import { getCollection } from '../services/cosmosdb.js';
import { Announcement, ContentType, CreateAnnouncementDto, Tag } from '../types.js';

/**
 * Announcement document interface for MongoDB
 */
interface AnnouncementDoc extends Document {
    _id: ObjectId;
    title: string;
    slug: string;
    type: ContentType;
    category: string;
    organization: string;
    content?: string;
    externalLink?: string;
    location?: string;
    deadline?: Date;
    minQualification?: string;
    ageLimit?: string;
    applicationFee?: string;
    totalPosts?: number;
    tags: string[];
    postedBy: number;
    postedAt: Date;
    updatedAt: Date;
    isActive: boolean;
    viewCount: number;
    jobDetails?: any;
}

/**
 * MongoDB-based Announcement Model
 * Replaces PostgreSQL version for Azure Cosmos DB
 */
export class AnnouncementModelMongo {
    private static get collection() {
        return getCollection<AnnouncementDoc>('announcements');
    }

    /**
     * Find all announcements with filters
     */
    static async findAll(filters?: {
        type?: ContentType;
        search?: string;
        category?: string;
        organization?: string;
        qualification?: string;
        sort?: 'newest' | 'oldest' | 'deadline';
        limit?: number;
        offset?: number;
    }): Promise<Announcement[]> {
        try {
            const query: Filter<AnnouncementDoc> = { isActive: true };

            if (filters?.type) {
                query.type = filters.type;
            }

            if (filters?.category) {
                query.category = { $regex: filters.category, $options: 'i' };
            }

            if (filters?.organization) {
                query.organization = { $regex: filters.organization, $options: 'i' };
            }

            if (filters?.qualification) {
                query.minQualification = { $regex: filters.qualification, $options: 'i' };
            }

            if (filters?.search) {
                query.$text = { $search: filters.search };
            }

            // Sort options
            let sort: Sort = { postedAt: -1 };
            switch (filters?.sort) {
                case 'oldest':
                    sort = { postedAt: 1 };
                    break;
                case 'deadline':
                    sort = { deadline: 1, postedAt: -1 };
                    break;
            }

            const limit = filters?.limit || 100;
            const skip = filters?.offset || 0;

            const docs = await this.collection
                .find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .toArray();

            return docs.map(this.docToAnnouncement);
        } catch (error) {
            console.error('[MongoDB] findAll error:', error);
            return [];
        }
    }

    /**
     * Cursor-based pagination for better performance
     */
    static async findAllWithCursor(filters?: {
        type?: ContentType;
        search?: string;
        category?: string;
        organization?: string;
        qualification?: string;
        sort?: 'newest' | 'oldest' | 'deadline';
        limit?: number;
        cursor?: string;
    }): Promise<{ data: Announcement[]; nextCursor: string | null; hasMore: boolean }> {
        try {
            const query: Filter<AnnouncementDoc> = { isActive: true };
            const limit = filters?.limit || 20;

            if (filters?.cursor) {
                const cursorId = new ObjectId(filters.cursor);
                if (filters?.sort === 'oldest') {
                    query._id = { $gt: cursorId };
                } else {
                    query._id = { $lt: cursorId };
                }
            }

            if (filters?.type) query.type = filters.type;
            if (filters?.category) query.category = { $regex: filters.category, $options: 'i' };
            if (filters?.organization) query.organization = { $regex: filters.organization, $options: 'i' };
            if (filters?.search) query.$text = { $search: filters.search };

            let sort: Sort = { _id: -1 };
            if (filters?.sort === 'oldest') sort = { _id: 1 };

            const docs = await this.collection
                .find(query)
                .sort(sort)
                .limit(limit + 1)
                .toArray();

            const hasMore = docs.length > limit;
            const data = hasMore ? docs.slice(0, limit) : docs;
            const nextCursor = hasMore && data.length > 0
                ? data[data.length - 1]._id.toString()
                : null;

            return {
                data: data.map(this.docToAnnouncement),
                nextCursor,
                hasMore,
            };
        } catch (error) {
            console.error('[MongoDB] findAllWithCursor error:', error);
            return { data: [], nextCursor: null, hasMore: false };
        }
    }

    /**
     * Find by slug
     */
    static async findBySlug(slug: string): Promise<Announcement | null> {
        try {
            const doc = await this.collection.findOne({ slug, isActive: true });
            return doc ? this.docToAnnouncement(doc) : null;
        } catch (error) {
            console.error('[MongoDB] findBySlug error:', error);
            return null;
        }
    }

    /**
     * Find by ID
     */
    static async findById(id: string): Promise<Announcement | null> {
        try {
            if (!ObjectId.isValid(id)) return null;
            const doc = await this.collection.findOne({ _id: new ObjectId(id) });
            return doc ? this.docToAnnouncement(doc) : null;
        } catch (error) {
            console.error('[MongoDB] findById error:', error);
            return null;
        }
    }

    /**
     * Create new announcement
     */
    static async create(data: CreateAnnouncementDto, userId: number): Promise<Announcement> {
        const slug = this.generateSlug(data.title);
        const now = new Date();

        const doc: Omit<AnnouncementDoc, '_id'> = {
            title: data.title,
            slug,
            type: data.type,
            category: data.category,
            organization: data.organization,
            content: data.content || undefined,
            externalLink: data.externalLink || undefined,
            location: data.location || undefined,
            deadline: data.deadline ? new Date(data.deadline) : undefined,
            minQualification: data.minQualification || undefined,
            ageLimit: data.ageLimit || undefined,
            applicationFee: data.applicationFee || undefined,
            totalPosts: data.totalPosts || undefined,
            tags: data.tags || [],
            postedBy: userId,
            postedAt: now,
            updatedAt: now,
            isActive: true,
            viewCount: 0,
            jobDetails: (data as any).jobDetails || undefined,
        };

        const result = await this.collection.insertOne(doc as AnnouncementDoc);
        return this.findById(result.insertedId.toString()) as Promise<Announcement>;
    }

    /**
     * Update announcement
     */
    static async update(id: string, data: Partial<CreateAnnouncementDto>): Promise<Announcement | null> {
        if (!ObjectId.isValid(id)) return null;

        const updateData: any = { updatedAt: new Date() };

        if (data.title) updateData.title = data.title;
        if (data.type) updateData.type = data.type;
        if (data.category) updateData.category = data.category;
        if (data.organization) updateData.organization = data.organization;
        if (data.content !== undefined) updateData.content = data.content;
        if (data.externalLink !== undefined) updateData.externalLink = data.externalLink;
        if (data.location !== undefined) updateData.location = data.location;
        if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null;
        if (data.minQualification !== undefined) updateData.minQualification = data.minQualification;
        if (data.ageLimit !== undefined) updateData.ageLimit = data.ageLimit;
        if (data.applicationFee !== undefined) updateData.applicationFee = data.applicationFee;
        if (data.totalPosts !== undefined) updateData.totalPosts = data.totalPosts;
        if (data.tags) updateData.tags = data.tags;

        await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        return this.findById(id);
    }

    /**
     * Delete announcement
     */
    static async delete(id: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) return false;
        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }

    /**
     * Soft delete (set isActive = false)
     */
    static async softDelete(id: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) return false;
        const result = await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { isActive: false, updatedAt: new Date() } }
        );
        return result.modifiedCount > 0;
    }

    /**
     * Increment view count
     */
    static async incrementViewCount(id: string): Promise<void> {
        if (!ObjectId.isValid(id)) return;
        await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $inc: { viewCount: 1 } }
        );
    }

    /**
     * Get trending announcements
     */
    static async getTrending(options?: { type?: ContentType; limit?: number }): Promise<Announcement[]> {
        try {
            const query: Filter<AnnouncementDoc> = { isActive: true };
            if (options?.type) query.type = options.type;

            const docs = await this.collection
                .find(query)
                .sort({ viewCount: -1, postedAt: -1 })
                .limit(options?.limit || 10)
                .toArray();

            return docs.map(this.docToAnnouncement);
        } catch (error) {
            console.error('[MongoDB] getTrending error:', error);
            return [];
        }
    }

    /**
     * Get announcements by deadline range
     */
    static async getByDeadlineRange(options: {
        startDate: Date;
        endDate: Date;
        limit?: number;
    }): Promise<Announcement[]> {
        try {
            const docs = await this.collection
                .find({
                    isActive: true,
                    deadline: { $gte: options.startDate, $lte: options.endDate },
                })
                .sort({ deadline: 1 })
                .limit(options.limit || 100)
                .toArray();

            return docs.map(this.docToAnnouncement);
        } catch (error) {
            console.error('[MongoDB] getByDeadlineRange error:', error);
            return [];
        }
    }

    /**
     * Get distinct categories
     */
    static async getCategories(): Promise<string[]> {
        try {
            return await this.collection.distinct('category', { isActive: true });
        } catch (error) {
            console.error('[MongoDB] getCategories error:', error);
            return [];
        }
    }

    /**
     * Get distinct organizations
     */
    static async getOrganizations(): Promise<string[]> {
        try {
            return await this.collection.distinct('organization', { isActive: true });
        } catch (error) {
            console.error('[MongoDB] getOrganizations error:', error);
            return [];
        }
    }

    /**
     * Get tags with counts
     */
    static async getTags(): Promise<{ name: string; count: number }[]> {
        try {
            const result = await this.collection.aggregate([
                { $match: { isActive: true } },
                { $unwind: '$tags' },
                { $group: { _id: '$tags', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 30 },
                { $project: { name: '$_id', count: 1, _id: 0 } },
            ]).toArray();

            return result as { name: string; count: number }[];
        } catch (error) {
            console.error('[MongoDB] getTags error:', error);
            return [];
        }
    }

    /**
     * Generate URL-safe slug
     */
    private static generateSlug(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 200) + '-' + Date.now();
    }

    /**
     * Convert MongoDB document to Announcement type
     */
    private static docToAnnouncement(doc: WithId<AnnouncementDoc>): Announcement {
        return {
            id: doc._id.toString() as any, // Keep as string for MongoDB
            title: doc.title,
            slug: doc.slug,
            type: doc.type,
            category: doc.category,
            organization: doc.organization,
            content: doc.content,
            externalLink: doc.externalLink,
            location: doc.location,
            deadline: doc.deadline?.toISOString() as any,
            minQualification: doc.minQualification,
            ageLimit: doc.ageLimit,
            applicationFee: doc.applicationFee,
            totalPosts: doc.totalPosts,
            tags: doc.tags?.map(t => ({ id: 0, name: t, slug: t.toLowerCase() })) || [],
            postedBy: doc.postedBy,
            postedAt: doc.postedAt?.toISOString(),
            updatedAt: doc.updatedAt?.toISOString(),
            isActive: doc.isActive,
            viewCount: doc.viewCount,
        };
    }
}

export default AnnouncementModelMongo;
