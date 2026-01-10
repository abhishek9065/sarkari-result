import { Request, Response, NextFunction } from 'express';
import { getCache, setCache } from '../utils/cache.js';
import { RedisCache } from '../services/redis.js';

interface CacheOptions {
    ttl?: number; // Time to live in seconds
    keyGenerator?: (req: Request) => string;
}

/**
 * Cache middleware - caches GET responses
 * Uses Redis as primary cache, falls back to in-memory
 * Usage: app.get('/api/endpoint', cacheMiddleware({ ttl: 300 }), handler)
 */
export function cacheMiddleware(options: CacheOptions = {}) {
    const { ttl = 300, keyGenerator } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generate cache key
        const cacheKey = keyGenerator
            ? keyGenerator(req)
            : `${req.originalUrl || req.url}`;

        // Check Redis first (if available), then memory
        let cachedData = await RedisCache.get(cacheKey);
        if (!cachedData) {
            cachedData = getCache(cacheKey);
        }

        if (cachedData) {
            res.set('X-Cache', RedisCache.isAvailable() ? 'HIT-REDIS' : 'HIT-MEMORY');
            return res.json(cachedData);
        }

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json to cache the response
        res.json = (data: any) => {
            // Store in Redis (async, non-blocking)
            RedisCache.set(cacheKey, data, ttl).catch(console.error);
            // Also store in memory as fallback
            setCache(cacheKey, data, ttl);
            res.set('X-Cache', 'MISS');
            return originalJson(data);
        };

        next();
    };
}

/**
 * Cache key generators for different endpoints
 * IMPORTANT: Include ALL query parameters that affect the response
 */
export const cacheKeys = {
    announcements: (req: Request) => {
        // Include all parameters that affect the response
        const params = [
            `type:${req.query.type || 'all'}`,
            `page:${req.query.page || 1}`,
            `limit:${req.query.limit || 50}`,
            `search:${req.query.search || ''}`,
            `category:${req.query.category || ''}`,
            `organization:${req.query.organization || ''}`,
            `qualification:${req.query.qualification || ''}`,
            `sort:${req.query.sort || 'latest'}`,
            `offset:${req.query.offset || 0}`,
        ];
        return `announcements:${params.join(':')}`;
    },

    announcementBySlug: (req: Request) => `announcement:${req.params.slug}`,

    trending: () => 'trending',

    calendar: (req: Request) => {
        // Use 1-based month to match route logic (getMonth() + 1)
        const month = req.query.month || (new Date().getMonth() + 1);
        const year = req.query.year || new Date().getFullYear();
        return `calendar:${year}:${month}`;
    },

    search: (req: Request) => {
        // Include all search parameters
        const params = [
            `q:${req.query.q || ''}`,
            `type:${req.query.type || 'all'}`,
            `limit:${req.query.limit || 20}`,
            `offset:${req.query.offset || 0}`,
        ];
        return `search:${params.join(':')}`;
    },
};
