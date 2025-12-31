import { Pool } from 'pg';

import { config } from './config.js';

// Optimized connection pool for high traffic (2000+ concurrent users)
export const pool = new Pool({
    connectionString: config.databaseUrl,
    // Connection pool settings
    max: 50,                      // Maximum 50 connections (up from default 10)
    min: 5,                       // Keep 5 connections warm
    idleTimeoutMillis: 30000,     // Close idle connections after 30s
    connectionTimeoutMillis: 5000, // Fail fast if can't connect in 5s
    // Statement timeout to prevent long-running queries
    statement_timeout: 10000,     // 10 second query timeout
});

// Log pool errors
pool.on('error', (err) => {
    console.error('[DB Pool] Unexpected error on idle client:', err);
});

// Log pool connection stats periodically (for debugging)
if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
        console.log(`[DB Pool] Total: ${pool.totalCount}, Idle: ${pool.idleCount}, Waiting: ${pool.waitingCount}`);
    }, 30000);
}

export const withClient = async <T>(fn: (client: Pool) => Promise<T>): Promise<T> => fn(pool);
