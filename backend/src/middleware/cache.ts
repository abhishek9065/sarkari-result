import { Request, Response, NextFunction } from 'express';
import { getCache, setCache } from '../utils/cache.js';

interface CacheOptions {
    ttl?: number; // Time to live in seconds
    keyGenerator?: (req: Request) => string;
}

/**
 * Cache middleware - caches GET responses
 * Usage: app.get('/api/endpoint', cacheMiddleware({ ttl: 300 }), handler)
 */
export function cacheMiddleware(options: CacheOptions = {}) {
    const { ttl = 300, keyGenerator } = options;

    return (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generate cache key
        const cacheKey = keyGenerator
            ? keyGenerator(req)
            : `${req.originalUrl || req.url}`;

        // Check cache
        const cachedData = getCache(cacheKey);
        if (cachedData) {
            res.set('X-Cache', 'HIT');
            return res.json(cachedData);
        }

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json to cache the response
        res.json = (data: any) => {
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
        const month = req.query.month || new Date().getMonth() + 1;
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
