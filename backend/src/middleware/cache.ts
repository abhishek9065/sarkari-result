import { Request, Response, NextFunction } from 'express';
import { getCache, setCache } from '../utils/cache';

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
 */
export const cacheKeys = {
    announcements: (req: Request) => {
        const type = req.query.type || 'all';
        const page = req.query.page || 1;
        const limit = req.query.limit || 50;
        return `announcements:${type}:${page}:${limit}`;
    },

    announcementBySlug: (req: Request) => `announcement:${req.params.slug}`,

    trending: () => 'trending',

    calendar: (req: Request) => {
        const month = req.query.month || new Date().getMonth();
        const year = req.query.year || new Date().getFullYear();
        return `calendar:${year}:${month}`;
    },

    search: (req: Request) => `search:${req.query.q}`,
};
