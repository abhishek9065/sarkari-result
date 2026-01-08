import { pool } from '../db.js';

/**
 * Simple in-memory cache with TTL support
 * Used for caching frequent database queries
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

class QueryCache {
    private static instance: QueryCache;
    private cache: Map<string, CacheEntry<any>> = new Map();
    private maxSize = 500; // Max cache entries

    private constructor() {
        // Cleanup expired entries every minute
        setInterval(() => this.cleanup(), 60 * 1000);
    }

    static getInstance(): QueryCache {
        if (!QueryCache.instance) {
            QueryCache.instance = new QueryCache();
        }
        return QueryCache.instance;
    }

    /**
     * Get cached data or fetch from database
     */
    async getOrFetch<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlSeconds: number = 60
    ): Promise<T> {
        const now = Date.now();
        const cached = this.cache.get(key);

        if (cached && cached.expiresAt > now) {
            return cached.data as T;
        }

        // Fetch fresh data
        const data = await fetcher();

        // Check cache size and evict if needed
        if (this.cache.size >= this.maxSize) {
            this.evictOldest();
        }

        // Cache the result
        this.cache.set(key, {
            data,
            expiresAt: now + (ttlSeconds * 1000)
        });

        return data;
    }

    /**
     * Invalidate cache entry
     */
    invalidate(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Invalidate all entries matching a prefix
     */
    invalidatePrefix(prefix: string): void {
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache stats
     */
    getStats(): { size: number; maxSize: number } {
        return {
            size: this.cache.size,
            maxSize: this.maxSize
        };
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiresAt < now) {
                this.cache.delete(key);
            }
        }
    }

    private evictOldest(): void {
        // Remove the oldest 10% of entries
        const toRemove = Math.max(1, Math.floor(this.maxSize * 0.1));
        const keys = Array.from(this.cache.keys()).slice(0, toRemove);
        keys.forEach(key => this.cache.delete(key));
    }
}

export const queryCache = QueryCache.getInstance();

/**
 * Pre-built cached queries for common operations
 */
export const CachedQueries = {
    /**
     * Get total announcement count (cached 5 min)
     */
    async getAnnouncementCount(): Promise<number> {
        return queryCache.getOrFetch(
            'announcements:count',
            async () => {
                const result = await pool.query('SELECT COUNT(*) FROM announcements WHERE is_active = true');
                return parseInt(result.rows[0].count);
            },
            300
        );
    },

    /**
     * Get announcements by type (cached 2 min)
     */
    async getAnnouncementsByType(type: string, limit: number = 20): Promise<any[]> {
        return queryCache.getOrFetch(
            `announcements:type:${type}:${limit}`,
            async () => {
                const result = await pool.query(`
                    SELECT id, title, slug, type, category, organization, 
                           posted_at as "postedAt", deadline, view_count as "viewCount"
                    FROM announcements 
                    WHERE is_active = true AND type = $1
                    ORDER BY posted_at DESC
                    LIMIT $2
                `, [type, limit]);
                return result.rows;
            },
            120
        );
    },

    /**
     * Get recent announcements (cached 1 min)
     */
    async getRecentAnnouncements(limit: number = 10): Promise<any[]> {
        return queryCache.getOrFetch(
            `announcements:recent:${limit}`,
            async () => {
                const result = await pool.query(`
                    SELECT id, title, slug, type, category, organization, 
                           posted_at as "postedAt", deadline, view_count as "viewCount"
                    FROM announcements 
                    WHERE is_active = true
                    ORDER BY posted_at DESC
                    LIMIT $1
                `, [limit]);
                return result.rows;
            },
            60
        );
    },

    /**
     * Get trending announcements (cached 5 min)
     */
    async getTrendingAnnouncements(limit: number = 10): Promise<any[]> {
        return queryCache.getOrFetch(
            `announcements:trending:${limit}`,
            async () => {
                const result = await pool.query(`
                    SELECT id, title, slug, type, category, organization, 
                           posted_at as "postedAt", deadline, view_count as "viewCount"
                    FROM announcements 
                    WHERE is_active = true
                      AND posted_at > NOW() - INTERVAL '7 days'
                    ORDER BY view_count DESC
                    LIMIT $1
                `, [limit]);
                return result.rows;
            },
            300
        );
    },

    /**
     * Get category counts (cached 10 min)
     */
    async getCategoryCounts(): Promise<Record<string, number>> {
        return queryCache.getOrFetch(
            'categories:counts',
            async () => {
                const result = await pool.query(`
                    SELECT type, COUNT(*) as count
                    FROM announcements
                    WHERE is_active = true
                    GROUP BY type
                `);
                return result.rows.reduce((acc, row) => {
                    acc[row.type] = parseInt(row.count);
                    return acc;
                }, {} as Record<string, number>);
            },
            600
        );
    }
};

/**
 * Invalidation helpers
 */
export function invalidateAnnouncementCache() {
    queryCache.invalidatePrefix('announcements:');
}

export function invalidateCategoryCache() {
    queryCache.invalidatePrefix('categories:');
}

export default queryCache;
