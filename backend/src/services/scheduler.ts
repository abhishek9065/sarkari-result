import { scrapeAllSources } from '../services/scraper.js';

// Scrape interval in milliseconds (30 minutes)
const SCRAPE_INTERVAL = 30 * 60 * 1000;

let scraperInterval: NodeJS.Timeout | null = null;

/**
 * Start the scheduled scraper
 * Runs every 30 minutes to fetch new jobs
 */
export function startScheduledScraper() {
    console.log('[Scheduler] Starting job scraper (every 30 minutes)');

    // Run immediately on startup
    setTimeout(() => {
        console.log('[Scheduler] Running initial scrape...');
        scrapeAllSources().catch(err => {
            console.error('[Scheduler] Initial scrape failed:', err);
        });
    }, 10000); // Wait 10 seconds after startup

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
 * Stop the scheduled scraper
 */
export function stopScheduledScraper() {
    if (scraperInterval) {
        clearInterval(scraperInterval);
        scraperInterval = null;
        console.log('[Scheduler] Scraper stopped');
    }
}

export default { startScheduledScraper, stopScheduledScraper };
