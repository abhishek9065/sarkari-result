import { config } from '../config.js';
import { pool } from '../db.js';
import { sendAnnouncementNotification } from './telegram.js';

interface ScrapedJob {
    title: string;
    organization: string;
    category: string;
    type: 'job' | 'result' | 'admit-card' | 'answer-key';
    externalLink: string;
    location?: string;
    totalPosts?: number;
    deadline?: string;
    content?: string;
}

interface FeedSource {
    name: string;
    url: string;
    type: 'rss' | 'json' | 'html';
    parser: (data: string) => ScrapedJob[];
}

// Government job feed sources
const FEED_SOURCES: FeedSource[] = [
    {
        name: 'Employment News',
        url: 'https://www.employmentnews.gov.in/rss/jobnotification.xml',
        type: 'rss',
        parser: parseEmploymentNewsRSS,
    },
    {
        name: 'NCS Jobs',
        url: 'https://www.ncs.gov.in/api/v1/jobs/latest',
        type: 'json',
        parser: parseNCSJSON,
    },
];

/**
 * Main scraper function - runs periodically
 */
export async function scrapeAllSources(): Promise<{ added: number; skipped: number }> {
    console.log('[Scraper] Starting job feed scrape...');
    let totalAdded = 0;
    let totalSkipped = 0;

    for (const source of FEED_SOURCES) {
        try {
            console.log(`[Scraper] Fetching from ${source.name}...`);
            const response = await fetch(source.url, {
                headers: {
                    'User-Agent': 'SarkariResult/1.0 (Government Job Aggregator)',
                },
                signal: AbortSignal.timeout(30000),
            });

            if (!response.ok) {
                console.error(`[Scraper] Failed to fetch ${source.name}: ${response.status}`);
                continue;
            }

            const data = await response.text();
            const jobs = source.parser(data);
            console.log(`[Scraper] Parsed ${jobs.length} jobs from ${source.name}`);

            for (const job of jobs) {
                const result = await addJobIfNew(job, source.name);
                if (result.added) {
                    totalAdded++;
                } else {
                    totalSkipped++;
                }
            }
        } catch (error) {
            console.error(`[Scraper] Error scraping ${source.name}:`, error);
        }
    }

    console.log(`[Scraper] Complete. Added: ${totalAdded}, Skipped: ${totalSkipped}`);
    return { added: totalAdded, skipped: totalSkipped };
}

/**
 * Check if job exists, if not add it
 */
async function addJobIfNew(job: ScrapedJob, source: string): Promise<{ added: boolean }> {
    try {
        // Check for duplicate by title + organization
        const existing = await pool.query(
            'SELECT id FROM announcements WHERE title = $1 AND organization = $2',
            [job.title, job.organization]
        );

        if (existing.rows.length > 0) {
            return { added: false };
        }

        // Generate slug
        const slug = generateSlug(job.title);

        // Insert new announcement
        const result = await pool.query(
            `INSERT INTO announcements 
             (title, slug, type, category, organization, external_link, location, total_posts, deadline, content, is_active, scraped_from)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11)
             RETURNING id, slug`,
            [
                job.title,
                slug,
                job.type,
                job.category,
                job.organization,
                job.externalLink,
                job.location,
                job.totalPosts,
                job.deadline,
                job.content || '',
                source,
            ]
        );

        console.log(`[Scraper] Added new job: ${job.title}`);

        // Send Telegram notification (async)
        const announcement = {
            id: result.rows[0].id,
            slug: result.rows[0].slug,
            title: job.title,
            type: job.type,
            category: job.category,
            organization: job.organization,
            totalPosts: job.totalPosts,
            deadline: job.deadline,
            location: job.location,
        };

        sendAnnouncementNotification(announcement as any).catch(err => {
            console.error('[Scraper] Telegram notification failed:', err);
        });

        return { added: true };
    } catch (error) {
        console.error('[Scraper] Error adding job:', error);
        return { added: false };
    }
}

/**
 * Generate URL-safe slug from title
 */
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100)
        + '-' + Date.now().toString(36);
}

/**
 * Parse Employment News RSS feed
 */
function parseEmploymentNewsRSS(xml: string): ScrapedJob[] {
    const jobs: ScrapedJob[] = [];

    // Simple XML parsing (for production, use a proper XML parser like fast-xml-parser)
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/;
    const linkRegex = /<link>(.*?)<\/link>/;
    const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>/;

    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
        const item = match[1];
        const title = titleRegex.exec(item)?.[1] || '';
        const link = linkRegex.exec(item)?.[1] || '';
        const desc = descRegex.exec(item)?.[1] || '';

        if (title && link) {
            const { organization, category, type } = parseJobDetails(title);
            jobs.push({
                title: title.trim(),
                organization,
                category,
                type,
                externalLink: link.trim(),
                content: desc.trim(),
            });
        }
    }

    return jobs;
}

/**
 * Parse NCS JSON API response
 */
function parseNCSJSON(jsonStr: string): ScrapedJob[] {
    try {
        const data = JSON.parse(jsonStr);
        const jobs = data.jobs || data.data || [];

        return jobs.map((job: any) => ({
            title: job.title || job.job_title,
            organization: job.organization || job.company_name || 'Government',
            category: job.category || 'Central Govt',
            type: 'job' as const,
            externalLink: job.url || job.apply_link || '',
            location: job.location || job.state,
            totalPosts: job.vacancies || job.posts,
            deadline: job.last_date || job.deadline,
        }));
    } catch {
        return [];
    }
}

/**
 * Extract organization, category, type from job title
 */
function parseJobDetails(title: string): { organization: string; category: string; type: 'job' | 'result' | 'admit-card' | 'answer-key' } {
    const titleLower = title.toLowerCase();

    // Detect type
    let type: 'job' | 'result' | 'admit-card' | 'answer-key' = 'job';
    if (titleLower.includes('result')) type = 'result';
    else if (titleLower.includes('admit card') || titleLower.includes('hall ticket')) type = 'admit-card';
    else if (titleLower.includes('answer key')) type = 'answer-key';

    // Detect organization
    let organization = 'Government of India';
    const orgPatterns = [
        { pattern: /upsc/i, org: 'UPSC' },
        { pattern: /ssc/i, org: 'SSC' },
        { pattern: /ibps/i, org: 'IBPS' },
        { pattern: /rrb/i, org: 'Railway Recruitment Board' },
        { pattern: /bank/i, org: 'Banking' },
        { pattern: /railway/i, org: 'Indian Railways' },
        { pattern: /army|defence|navy|airforce/i, org: 'Defence' },
        { pattern: /police/i, org: 'Police Department' },
        { pattern: /psc/i, org: 'State PSC' },
    ];

    for (const { pattern, org } of orgPatterns) {
        if (pattern.test(title)) {
            organization = org;
            break;
        }
    }

    // Detect category
    let category = 'Central Govt';
    if (/state|bihar|up |uttar pradesh|rajasthan|mp |madhya pradesh/i.test(title)) {
        category = 'State Govt';
    } else if (/bank|ibps|sbi|rbi/i.test(title)) {
        category = 'Bank Jobs';
    } else if (/railway|rrb/i.test(title)) {
        category = 'Railway Jobs';
    } else if (/defence|army|navy|airforce/i.test(title)) {
        category = 'Defence Jobs';
    }

    return { organization, category, type };
}

export default { scrapeAllSources };
