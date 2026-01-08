import { pool } from '../db.js';

/**
 * Database index and performance optimization utilities
 * Run these during maintenance windows or on deploy
 */

/**
 * Ensure all required indexes exist
 */
export async function ensureIndexes(): Promise<void> {
    console.log('[DB] Ensuring indexes exist...');

    const indexes = [
        // Announcements table
        'CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type)',
        'CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active)',
        'CREATE INDEX IF NOT EXISTS idx_announcements_posted_at ON announcements(posted_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_announcements_deadline ON announcements(deadline)',
        'CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category)',
        'CREATE INDEX IF NOT EXISTS idx_announcements_organization ON announcements(organization)',
        'CREATE INDEX IF NOT EXISTS idx_announcements_slug ON announcements(slug)',
        'CREATE INDEX IF NOT EXISTS idx_announcements_views ON announcements(view_count DESC)',

        // Composite indexes for common queries
        'CREATE INDEX IF NOT EXISTS idx_announcements_active_type ON announcements(is_active, type, posted_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_announcements_active_deadline ON announcements(is_active, deadline) WHERE deadline IS NOT NULL',

        // Users table
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
        'CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at DESC)',

        // Bookmarks table
        'CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_bookmarks_announcement ON bookmarks(announcement_id)',
        'CREATE INDEX IF NOT EXISTS idx_bookmarks_user_announcement ON bookmarks(user_id, announcement_id)',

        // User profiles table
        'CREATE INDEX IF NOT EXISTS idx_profiles_user ON user_profiles(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_profiles_categories ON user_profiles USING GIN(preferred_categories)',

        // Analytics events
        'CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type)',
        'CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id) WHERE user_id IS NOT NULL',

        // Email subscriptions
        'CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON email_subscriptions(email)',
        'CREATE INDEX IF NOT EXISTS idx_subscriptions_verified ON email_subscriptions(is_verified)',
    ];

    for (const sql of indexes) {
        try {
            await pool.query(sql);
        } catch (error) {
            console.error(`[DB] Failed to create index: ${sql}`, error);
        }
    }

    console.log('[DB] Index creation complete');
}

/**
 * Analyze tables for query planner optimization
 */
export async function analyzeTable(tableName: string): Promise<void> {
    try {
        await pool.query(`ANALYZE ${tableName}`);
        console.log(`[DB] Analyzed table: ${tableName}`);
    } catch (error) {
        console.error(`[DB] Failed to analyze ${tableName}:`, error);
    }
}

/**
 * Get table statistics
 */
export async function getTableStats(): Promise<any[]> {
    try {
        const result = await pool.query(`
            SELECT 
                relname as table_name,
                n_live_tup as row_count,
                n_dead_tup as dead_rows,
                last_vacuum,
                last_analyze
            FROM pg_stat_user_tables
            ORDER BY n_live_tup DESC
        `);
        return result.rows;
    } catch (error) {
        console.error('[DB] Failed to get table stats:', error);
        return [];
    }
}

/**
 * Get slow queries (if pg_stat_statements is available)
 */
export async function getSlowQueries(limit: number = 10): Promise<any[]> {
    try {
        const result = await pool.query(`
            SELECT 
                query,
                calls,
                mean_exec_time as avg_time_ms,
                total_exec_time as total_time_ms
            FROM pg_stat_statements
            ORDER BY mean_exec_time DESC
            LIMIT $1
        `, [limit]);
        return result.rows;
    } catch {
        // pg_stat_statements not available
        return [];
    }
}

/**
 * Connection pool health check
 */
export function getPoolStats() {
    return {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
    };
}

/**
 * Run full optimization suite
 */
export async function runOptimizations(): Promise<void> {
    console.log('[DB] Starting optimization suite...');

    // Ensure indexes
    await ensureIndexes();

    // Analyze main tables
    const tables = ['announcements', 'users', 'bookmarks', 'user_profiles'];
    for (const table of tables) {
        await analyzeTable(table);
    }

    console.log('[DB] Optimization complete');
}

export default {
    ensureIndexes,
    analyzeTable,
    getTableStats,
    getSlowQueries,
    getPoolStats,
    runOptimizations
};
