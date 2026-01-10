import { Request, Response, NextFunction } from 'express';
import { getRealIp } from './cloudflare.js';
import { SecurityLogger } from '../services/securityLogger.js';
import { pool } from '../db.js';
import { config } from '../config.js';

/**
 * Database-backed rate limiter
 * Works across multiple instances and survives restarts
 * 
 * Uses PostgreSQL to track request counts per IP, falling back to
 * in-memory storage if database is unavailable.
 */

// Fallback in-memory store for when DB is unavailable
const memoryStore = new Map<string, { count: number; resetTime: number }>();
const MAX_STORE_SIZE = 10000; // Max distinct IPs to track in memory

interface RateLimitOptions {
    windowMs?: number;  // Time window in milliseconds
    maxRequests?: number;  // Max requests per window
    keyPrefix?: string;  // Prefix for rate limit key (e.g., 'api', 'auth')
}

/**
 * Create rate limit table if it doesn't exist
 */
async function ensureRateLimitTable(): Promise<void> {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS rate_limits (
                id SERIAL PRIMARY KEY,
                key VARCHAR(255) NOT NULL,
                count INTEGER DEFAULT 1,
                reset_time BIGINT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(key)
            );
            CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
            CREATE INDEX IF NOT EXISTS idx_rate_limits_reset ON rate_limits(reset_time);
        `);
    } catch (error) {
        console.error('[RateLimit] Failed to create table:', error);
    }
}

// Initialize table on startup
ensureRateLimitTable();

/**
 * Try to increment rate limit in database
 * Returns: { allowed: boolean, count: number, resetTime: number }
 */
async function checkRateLimitDB(
    key: string,
    maxRequests: number,
    windowMs: number
): Promise<{ allowed: boolean; count: number; resetTime: number } | null> {
    const now = Date.now();
    const resetTime = now + windowMs;

    try {
        // Try to insert or update the rate limit record
        const result = await pool.query(
            `
            INSERT INTO rate_limits (key, count, reset_time)
            VALUES ($1, 1, $2)
            ON CONFLICT (key) DO UPDATE SET
                count = CASE 
                    WHEN rate_limits.reset_time < $3 THEN 1
                    ELSE rate_limits.count + 1
                END,
                reset_time = CASE
                    WHEN rate_limits.reset_time < $3 THEN $2
                    ELSE rate_limits.reset_time
                END
            RETURNING count, reset_time
            `,
            [key, resetTime, now]
        );

        const { count, reset_time } = result.rows[0];
        return {
            allowed: count <= maxRequests,
            count,
            resetTime: Number(reset_time)
        };
    } catch (error) {
        console.error('[RateLimit] Database error, falling back to memory:', error);
        return null; // Fall back to memory
    }
}

/**
 * In-memory rate limit check (fallback)
 */
function checkRateLimitMemory(
    key: string,
    maxRequests: number,
    windowMs: number
): { allowed: boolean; count: number; resetTime: number } {
    const now = Date.now();
    const data = memoryStore.get(key);

    if (!data || now > data.resetTime) {
        // New window
        // Limit memory usage
        if (memoryStore.size >= MAX_STORE_SIZE) {
            // Remove oldest
            const firstKey = memoryStore.keys().next().value;
            if (firstKey) memoryStore.delete(firstKey);
        }
        memoryStore.set(key, { count: 1, resetTime: now + windowMs });
        return { allowed: true, count: 1, resetTime: now + windowMs };
    }

    data.count++;
    return {
        allowed: data.count <= maxRequests,
        count: data.count,
        resetTime: data.resetTime
    };
}

/**
 * Rate limit middleware factory
 */
export function rateLimit(options: RateLimitOptions = {}) {
    const windowMs = options.windowMs || 60000; // 1 minute default
    const maxRequests = options.maxRequests || 100; // 100 requests default
    const keyPrefix = options.keyPrefix || 'rl';

    return async (req: Request, res: Response, next: NextFunction) => {
        // Use Cloudflare real IP if available, otherwise fallback
        const clientIp = getRealIp(req);
        const key = `${keyPrefix}:${clientIp}`;

        // Try database first, fall back to memory
        let result = await checkRateLimitDB(key, maxRequests, windowMs);

        if (!result) {
            result = checkRateLimitMemory(key, maxRequests, windowMs);
        }

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - result.count));
        res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));

        if (!result.allowed) {
            // Log security event
            SecurityLogger.log({
                ip_address: clientIp,
                event_type: 'rate_limit',
                endpoint: req.originalUrl || req.url,
                metadata: {
                    limit: maxRequests,
                    windowMs,
                    userAgent: req.headers['user-agent']
                }
            });

            res.status(429).json({
                error: 'Too many requests',
                retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
            });
            return;
        }

        next();
    };
}

/**
 * Cleanup expired rate limit records periodically
 */
async function cleanupExpiredRecords() {
    try {
        const now = Date.now();
        await pool.query('DELETE FROM rate_limits WHERE reset_time < $1', [now]);

        // Also clean memory store
        for (const [key, data] of memoryStore.entries()) {
            if (now > data.resetTime) {
                memoryStore.delete(key);
            }
        }
    } catch (error) {
        // Silently fail cleanup - not critical
    }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredRecords, 5 * 60 * 1000);

export default rateLimit;
