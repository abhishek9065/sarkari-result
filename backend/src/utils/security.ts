import crypto from 'crypto';
import { pool } from '../db.js';

/**
 * Token blacklist for invalidated JWTs (logout, password change)
 * Uses PostgreSQL for persistence across instances with in-memory fallback
 */

// Fallback in-memory blacklist (used when DB is unavailable)
const tokenBlacklistMemory = new Set<string>();

// Ensure blacklist table exists
async function ensureBlacklistTable(): Promise<void> {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS token_blacklist (
                token_hash VARCHAR(64) PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires 
            ON token_blacklist(expires_at);
        `);
    } catch (error) {
        console.error('[Security] Failed to create token_blacklist table:', error);
    }
}

ensureBlacklistTable();

/**
 * Security audit log
 */
interface SecurityEvent {
    timestamp: Date;
    event: string;
    ip: string;
    userAgent: string;
    userId?: number;
    details?: string;
}

const securityLogs: SecurityEvent[] = [];
const MAX_SECURITY_LOGS = 10000;

/**
 * Add token to blacklist (called on logout)
 * Stores in both database (for multi-instance) and memory (for fast lookup)
 */
export async function blacklistToken(token: string, expiresInSeconds: number = 86400): Promise<void> {
    // Hash the token for storage (don't store actual token)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    try {
        // Store in database
        await pool.query(
            `INSERT INTO token_blacklist (token_hash, expires_at)
             VALUES ($1, $2)
             ON CONFLICT (token_hash) DO NOTHING`,
            [hashedToken, expiresAt]
        );
    } catch (error) {
        console.error('[Security] Failed to store blacklisted token in DB:', error);
    }

    // Also store in memory for fast local lookup
    tokenBlacklistMemory.add(hashedToken);
    console.log(`[SECURITY] Token blacklisted`);
}

/**
 * Check if token is blacklisted
 * Checks memory first (fast), then database (distributed)
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Fast check in memory first
    if (tokenBlacklistMemory.has(hashedToken)) {
        return true;
    }

    // Check database for multi-instance consistency
    try {
        const result = await pool.query(
            `SELECT 1 FROM token_blacklist 
             WHERE token_hash = $1 AND expires_at > NOW()
             LIMIT 1`,
            [hashedToken]
        );
        if (result.rows.length > 0) {
            // Add to memory cache for faster future lookups
            tokenBlacklistMemory.add(hashedToken);
            return true;
        }
    } catch (error) {
        // If DB fails, fall back to memory check only
        console.error('[Security] Failed to check blacklist in DB:', error);
    }

    return false;
}

/**
 * Synchronous blacklist check for middleware compatibility
 * Uses memory only - async check runs in background
 */
export function isTokenBlacklistedSync(token: string): boolean {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return tokenBlacklistMemory.has(hashedToken);
}

/**
 * Log security event for audit trail
 */
export function logSecurityEvent(
    event: string,
    ip: string,
    userAgent: string,
    userId?: number,
    details?: string
): void {
    const logEntry: SecurityEvent = {
        timestamp: new Date(),
        event,
        ip,
        userAgent: userAgent.substring(0, 200), // Limit length
        userId,
        details
    };

    securityLogs.push(logEntry);

    // Keep log size manageable
    if (securityLogs.length > MAX_SECURITY_LOGS) {
        securityLogs.shift();
    }

    // Log to console for monitoring
    console.log(`[SECURITY EVENT] ${event} | IP: ${ip} | User: ${userId || 'anonymous'}`);
}

/**
 * Get recent security logs (admin only)
 */
export function getSecurityLogs(limit: number = 100): SecurityEvent[] {
    return securityLogs.slice(-limit).reverse();
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data (for storage)
 */
export function hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Suspicious pattern detection
 */
const suspiciousPatterns = [
    // SQL Injection patterns
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b.*\b(from|into|where|table)\b)/i,
    /(\bor\b\s+\d+\s*=\s*\d+)/i,
    /(--|#|\/\*)/,

    // Path traversal
    /\.\.\//,
    /\.\.\\/,

    // Script injection
    /<script[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,

    // Command injection
    /[|;&`$]/,
];

/**
 * Check if input contains suspicious patterns
 */
export function containsSuspiciousPatterns(input: string): boolean {
    if (typeof input !== 'string') return false;
    return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Deep check object for suspicious patterns
 */
export function hasSuspiciousContent(obj: any): boolean {
    if (typeof obj === 'string') {
        return containsSuspiciousPatterns(obj);
    }
    if (Array.isArray(obj)) {
        return obj.some(item => hasSuspiciousContent(item));
    }
    if (obj && typeof obj === 'object') {
        return Object.values(obj).some(value => hasSuspiciousContent(value));
    }
    return false;
}

/**
 * Request fingerprinting for tracking
 */
export function generateRequestFingerprint(
    ip: string,
    userAgent: string,
    acceptLanguage: string
): string {
    const data = `${ip}|${userAgent}|${acceptLanguage}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

// Cleanup expired blacklist entries periodically
setInterval(async () => {
    // Cleanup database
    try {
        await pool.query('DELETE FROM token_blacklist WHERE expires_at < NOW()');
    } catch (error) {
        // Silently fail - not critical
    }

    // Cleanup memory if too large (tokens expire with JWT anyway)
    if (tokenBlacklistMemory.size > 10000) {
        tokenBlacklistMemory.clear();
        console.log('[SECURITY] Cleared in-memory token blacklist');
    }
}, 60 * 60 * 1000); // Every hour
