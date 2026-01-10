import { scrapeAllSources } from '../services/scraper.js';
import { RedisCache } from '../services/redis.js';
import { getDatabase } from '../services/cosmosdb.js';

// Intervals in milliseconds
const SCRAPE_INTERVAL = 30 * 60 * 1000;          // 30 minutes
const CACHE_CLEANUP_INTERVAL = 60 * 60 * 1000;   // 1 hour
const TRENDING_UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes
const DEADLINE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

let scraperInterval: NodeJS.Timeout | null = null;
let cacheCleanupInterval: NodeJS.Timeout | null = null;
let trendingUpdateInterval: NodeJS.Timeout | null = null;
let deadlineCheckInterval: NodeJS.Timeout | null = null;

/**
 * Start the scheduled scraper
 * Runs every 30 minutes to fetch new jobs
 */
export function startScheduledScraper(): void {
    console.log('[Scheduler] Starting job scraper (every 30 minutes)');

    // Run immediately on startup
    setTimeout(() => {
        console.log('[Scheduler] Running initial scrape...');
        scrapeAllSources().catch(err => {
            console.error('[Scheduler] Initial scrape failed:', err);
        });
    }, 10000);

    // Schedule recurring scrapes
    scraperInterval = setInterval(async () => {
        console.log('[Scheduler] Running scheduled scrape...');
        try {
            const result = await scrapeAllSources();
            console.log(`[Scheduler] Scrape complete: ${result.added} new, ${result.skipped} skipped`);
        } catch (error) {
            console.error('[Scheduler] Scheduled scrape failed:', error);
        }
    }, SCRAPE_INTERVAL);
}

/**
 * Start cache cleanup job
 * Clears expired cache entries every hour
 */
export function startCacheCleanup(): void {
    console.log('[Scheduler] Starting cache cleanup (every 1 hour)');

    cacheCleanupInterval = setInterval(async () => {
        console.log('[Scheduler] Running cache cleanup...');
        try {
            // Invalidate old cache patterns
            await RedisCache.invalidatePattern('announcements:*');
            await RedisCache.invalidatePattern('trending:*');
            console.log('[Scheduler] Cache cleanup complete');
        } catch (error) {
            console.error('[Scheduler] Cache cleanup failed:', error);
        }
    }, CACHE_CLEANUP_INTERVAL);
}

/**
 * Update trending/popular items cache
 * Runs every 15 minutes
 */
export function startTrendingUpdates(): void {
    console.log('[Scheduler] Starting trending updates (every 15 minutes)');

    trendingUpdateInterval = setInterval(async () => {
        try {
            const db = getDatabase();
            if (!db) return;

            const announcements = db.collection('announcements');

            // Update view counts aggregation for trending
            const trending = await announcements
                .find({ isActive: true })
                .sort({ viewCount: -1 })
                .limit(10)
                .toArray();

            // Cache trending results
            if (trending.length > 0) {
                await RedisCache.set('trending:all', JSON.stringify(trending), 900); // 15 min TTL
                console.log(`[Scheduler] Trending cache updated: ${trending.length} items`);
            }
        } catch (error) {
            console.error('[Scheduler] Trending update failed:', error);
        }
    }, TRENDING_UPDATE_INTERVAL);
}

/**
 * Check for approaching deadlines and notify users
 * Runs once per day
 */
export function startDeadlineChecker(): void {
    console.log('[Scheduler] Starting deadline checker (daily)');

    // Run immediately on startup
    setTimeout(() => {
        checkUpcomingDeadlines();
    }, 60000); // Wait 1 minute after startup

    deadlineCheckInterval = setInterval(() => {
        checkUpcomingDeadlines();
    }, DEADLINE_CHECK_INTERVAL);
}

async function checkUpcomingDeadlines(): Promise<void> {
    try {
        const db = getDatabase();
        if (!db) return;

        const announcements = db.collection('announcements');
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        // Find announcements with deadlines in the next 3 days
        const upcomingDeadlines = await announcements.find({
            isActive: true,
            deadline: {
                $gte: now,
                $lte: threeDaysFromNow
            }
        }).toArray();

        if (upcomingDeadlines.length > 0) {
            console.log(`[Scheduler] Found ${upcomingDeadlines.length} announcements with deadlines in next 3 days`);
            // TODO: Send push notifications or emails to subscribed users
        }
    } catch (error) {
        console.error('[Scheduler] Deadline check failed:', error);
    }
}

/**
 * Start all scheduled jobs
 */
export function startAllJobs(): void {
    startScheduledScraper();
    startCacheCleanup();
    startTrendingUpdates();
    startDeadlineChecker();
    console.log('[Scheduler] All scheduled jobs started');
}

/**
 * Stop the scheduled scraper
 */
export function stopScheduledScraper(): void {
    if (scraperInterval) {
        clearInterval(scraperInterval);
        scraperInterval = null;
        console.log('[Scheduler] Scraper stopped');
    }
}

/**
 * Stop all scheduled jobs
 */
export function stopAllJobs(): void {
    if (scraperInterval) clearInterval(scraperInterval);
    if (cacheCleanupInterval) clearInterval(cacheCleanupInterval);
    if (trendingUpdateInterval) clearInterval(trendingUpdateInterval);
    if (deadlineCheckInterval) clearInterval(deadlineCheckInterval);

    scraperInterval = null;
    cacheCleanupInterval = null;
    trendingUpdateInterval = null;
    deadlineCheckInterval = null;

    console.log('[Scheduler] All jobs stopped');
}

export default {
    startScheduledScraper,
    stopScheduledScraper,
    startAllJobs,
    stopAllJobs,
    startCacheCleanup,
    startTrendingUpdates,
    startDeadlineChecker
};

