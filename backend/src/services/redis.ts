import { getCache as getMemoryCache, setCache as setMemoryCache } from '../utils/cache.js';

/**
 * Redis Cache Service using Upstash REST API
 * Falls back to in-memory cache if Redis is unavailable
 */

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const isRedisConfigured = !!(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN);

if (!isRedisConfigured) {
    console.log('⚠️ Redis not configured. Using in-memory cache fallback.');
}

/**
 * Execute Redis command via Upstash REST API
 */
async function redisCommand(command: string[]): Promise<any> {
    if (!isRedisConfigured) return null;

    try {
        const response = await fetch(`${UPSTASH_REDIS_REST_URL}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(command),
        });

        if (!response.ok) {
            console.error('Redis error:', response.statusText);
            return null;
        }

        const data = await response.json() as { result: any };
        return data.result;
    } catch (error) {
        console.error('Redis connection error:', error);
        return null;
    }
}

/**
 * Get value from Redis cache
 * Falls back to memory cache if Redis unavailable
 */
export async function get(key: string): Promise<any | null> {
    // Try Redis first
    if (isRedisConfigured) {
        const result = await redisCommand(['GET', key]);
        if (result) {
            try {
                return JSON.parse(result);
            } catch {
                return result;
            }
        }
    }

    // Fallback to memory cache
    return getMemoryCache(key);
}

/**
 * Set value in Redis cache with TTL
 * Also sets in memory cache as backup
 */
export async function set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    // Try Redis first
    if (isRedisConfigured) {
        await redisCommand(['SET', key, stringValue, 'EX', ttlSeconds.toString()]);
    }

    // Also set in memory cache as fallback
    setMemoryCache(key, value, ttlSeconds);
}

/**
 * Delete key(s) from Redis cache
 */
export async function del(key: string): Promise<void> {
    if (isRedisConfigured) {
        await redisCommand(['DEL', key]);
    }
}

/**
 * Delete all keys matching a pattern
 */
export async function invalidatePattern(pattern: string): Promise<void> {
    if (isRedisConfigured) {
        // Upstash doesn't support KEYS in free tier, so we skip pattern deletion
        // The TTL will handle expiration
        console.log(`Cache pattern invalidation requested: ${pattern}`);
    }
}

/**
 * Check if Redis is available
 */
export function isAvailable(): boolean {
    return isRedisConfigured;
}

export const RedisCache = {
    get,
    set,
    del,
    invalidatePattern,
    isAvailable,
};

export default RedisCache;
