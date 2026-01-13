import { RedisCache } from './redis.js';

const VERSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function normalizeGroup(group: string): string {
  const normalized = group.trim();
  return normalized.length > 0 ? normalized : 'default';
}

function parseVersion(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(1, Math.floor(value));
  }
  if (typeof value === 'string' && /^[0-9]+$/.test(value)) {
    return Math.max(1, parseInt(value, 10));
  }
  return null;
}

export async function getCacheVersion(group: string): Promise<number> {
  const normalized = normalizeGroup(group);
  const key = `cache_version:${normalized}`;

  const cached = await RedisCache.get(key);
  const parsed = parseVersion(cached);
  if (parsed) {
    return parsed;
  }

  const initialVersion = 1;
  await RedisCache.set(key, initialVersion, VERSION_TTL_SECONDS);
  return initialVersion;
}

export async function bumpCacheVersion(group: string): Promise<number> {
  const normalized = normalizeGroup(group);
  const key = `cache_version:${normalized}`;

  const current = await getCacheVersion(normalized);
  const next = current + 1;
  await RedisCache.set(key, next, VERSION_TTL_SECONDS);
  return next;
}
