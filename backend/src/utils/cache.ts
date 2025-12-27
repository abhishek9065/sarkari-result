// Simple in-memory cache for API responses
interface CacheEntry {
    data: any;
    expiry: number;
}

const cache = new Map<string, CacheEntry>();

export function getCache(key: string): any | null {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
        cache.delete(key);
        return null;
    }

    return entry.data;
}

export function setCache(key: string, data: any, ttlSeconds: number = 300): void {
    cache.set(key, {
        data,
        expiry: Date.now() + (ttlSeconds * 1000),
    });
}

export function invalidateCache(pattern?: string): void {
    if (!pattern) {
        cache.clear();
        return;
    }

    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    }
}

// Cleanup expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
        if (now > entry.expiry) {
            cache.delete(key);
        }
    }
}, 60000);

export default { getCache, setCache, invalidateCache };
