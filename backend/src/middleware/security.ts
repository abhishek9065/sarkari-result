import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { pool } from '../db.js';

/**
 * Comprehensive security middleware
 * Applies multiple security layers to protect against common attacks
 * 
 * Note: Brute-force protection uses PostgreSQL for persistence across
 * instances and restarts, with in-memory fallback if DB is unavailable.
 */

// Fallback in-memory store (used when DB is unavailable)
const failedLoginsMemory = new Map<string, { count: number; blockedUntil: number }>();

// Ensure brute-force table exists
async function ensureBruteForceTable(): Promise<void> {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS failed_logins (
                ip VARCHAR(45) PRIMARY KEY,
                count INTEGER DEFAULT 1,
                blocked_until BIGINT DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    } catch (error) {
        console.error('[Security] Failed to create brute-force table:', error);
    }
}

ensureBruteForceTable();

/**
 * Helmet security headers configuration
 * Protects against: XSS, clickjacking, MIME sniffing, etc.
 * 
 * Note: This backend serves only JSON API responses, not HTML.
 * CSP is stricter since we don't need inline scripts/styles.
 */
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'none'"], // Deny everything by default for API
            scriptSrc: ["'none'"], // No scripts needed for JSON API
            styleSrc: ["'none'"], // No styles needed for JSON API
            fontSrc: ["'none'"], // No fonts needed for JSON API
            imgSrc: ["'none'"], // No images served from API
            connectSrc: ["'self'"], // Only allow connections to self
            frameSrc: ["'none'"], // No frames needed
            objectSrc: ["'none'"], // No plugins
            baseUri: ["'none'"], // Prevent base tag injection
            formAction: ["'none'"], // No forms in API responses
            frameAncestors: ["'none'"], // Prevent embedding
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false, // Allow CORS
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow CORS
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xContentTypeOptions: true, // nosniff
    xFrameOptions: { action: "deny" }, // Prevent clickjacking
    xXssProtection: false, // Deprecated, rely on CSP instead
});

/**
 * Brute-force protection for login attempts
 * Blocks IP after 5 failed attempts for 15 minutes
 * Uses PostgreSQL with in-memory fallback
 */
export async function bruteForceProtection(req: Request, res: Response, next: NextFunction) {
    const ip = getClientIP(req);
    const now = Date.now();

    try {
        // Try database first
        const result = await pool.query(
            'SELECT count, blocked_until FROM failed_logins WHERE ip = $1',
            [ip]
        );

        if (result.rows.length > 0) {
            const { blocked_until } = result.rows[0];
            if (now < Number(blocked_until)) {
                const waitTime = Math.ceil((Number(blocked_until) - now) / 1000 / 60);
                return res.status(429).json({
                    error: 'Too many failed login attempts',
                    message: `Please try again in ${waitTime} minutes`,
                    blockedUntil: Number(blocked_until)
                });
            }
        }
    } catch (error) {
        // Fall back to memory
        const record = failedLoginsMemory.get(ip);
        if (record && now < record.blockedUntil) {
            const waitTime = Math.ceil((record.blockedUntil - now) / 1000 / 60);
            return res.status(429).json({
                error: 'Too many failed login attempts',
                message: `Please try again in ${waitTime} minutes`,
                blockedUntil: record.blockedUntil
            });
        }
    }

    next();
}

/**
 * Record failed login attempt
 * Call this after a failed login
 */
export async function recordFailedLogin(ip: string) {
    const now = Date.now();
    const blockTime = now + 15 * 60 * 1000; // 15 minutes

    try {
        // Upsert to database
        const result = await pool.query(
            `INSERT INTO failed_logins (ip, count, blocked_until, updated_at)
             VALUES ($1, 1, 0, NOW())
             ON CONFLICT (ip) DO UPDATE SET
                 count = failed_logins.count + 1,
                 blocked_until = CASE 
                     WHEN failed_logins.count + 1 >= 5 THEN $2
                     ELSE failed_logins.blocked_until
                 END,
                 updated_at = NOW()
             RETURNING count`,
            [ip, blockTime]
        );

        if (result.rows[0].count >= 5) {
            console.log(`[SECURITY] IP ${ip} blocked for 15 minutes due to failed login attempts`);
        }
    } catch (error) {
        // Fall back to memory
        const record = failedLoginsMemory.get(ip);
        if (!record) {
            failedLoginsMemory.set(ip, { count: 1, blockedUntil: 0 });
        } else {
            record.count++;
            if (record.count >= 5) {
                record.blockedUntil = blockTime;
                console.log(`[SECURITY] IP ${ip} blocked for 15 minutes due to failed login attempts (memory)`);
            }
        }
    }
}

/**
 * Clear failed login record on successful login
 */
export async function clearFailedLogins(ip: string) {
    try {
        await pool.query('DELETE FROM failed_logins WHERE ip = $1', [ip]);
    } catch (error) {
        // Fall back to memory cleanup
    }
    failedLoginsMemory.delete(ip);
}

/**
 * Get real client IP (handles proxies)
 */
export function getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        const ips = (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',');
        return ips[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Sanitize user input to prevent XSS
 * Removes/escapes dangerous characters
 */
export function sanitizeInput(input: string): string {
    if (typeof input !== 'string') return input;

    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/`/g, '&#96;')
        .trim();
}

/**
 * Fields that should NOT be sanitized (passwords, tokens, etc.)
 * These fields need their exact values preserved for authentication
 */
const SENSITIVE_FIELDS = new Set([
    'password',
    'currentPassword',
    'newPassword',
    'confirmPassword',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'secret',
    'auth',
    'p256dh',  // Push notification key
    'authorization',
    'externalLink',
    'imageData',
]);

/**
 * Sanitize object recursively, skipping sensitive fields
 */
export function sanitizeObject<T extends object>(obj: T, parentKey?: string): T {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
        // Skip sanitization for sensitive fields
        if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
            result[key] = value;
        } else if (typeof value === 'string') {
            result[key] = sanitizeInput(value);
        } else if (Array.isArray(value)) {
            result[key] = value.map(item => {
                if (typeof item === 'string') {
                    return sanitizeInput(item);
                }
                if (item && typeof item === 'object') {
                    return sanitizeObject(item);
                }
                return item;
            });
        } else if (value && typeof value === 'object') {
            result[key] = sanitizeObject(value, key);
        } else {
            result[key] = value;
        }
    }
    return result as T;
}

/**
 * Request sanitization middleware
 */
export function sanitizeRequestBody(req: Request, res: Response, next: NextFunction) {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    next();
}

/**
 * Block suspicious user agents (basic bot detection)
 */
export function blockSuspiciousAgents(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.headers['user-agent'] || '';

    // Block common vulnerability scanners
    const maliciousPatterns = [
        /nikto/i, /sqlmap/i, /nmap/i, /masscan/i,
        /havij/i, /acunetix/i, /nessus/i, /burp/i,
        /metasploit/i, /w3af/i
    ];

    if (maliciousPatterns.some(pattern => pattern.test(userAgent))) {
        console.log(`[SECURITY] Blocked suspicious user agent: ${userAgent}`);
        return res.status(403).json({ error: 'Access denied' });
    }

    next();
}

/**
 * Validate Content-Type for POST/PUT/PATCH
 */
export function validateContentType(req: Request, res: Response, next: NextFunction) {
    const methods = ['POST', 'PUT', 'PATCH'];

    if (methods.includes(req.method)) {
        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('application/json')) {
            return res.status(415).json({ error: 'Content-Type must be application/json' });
        }
    }

    next();
}

// Cleanup old blocked IPs periodically (both DB and memory)
setInterval(async () => {
    const now = Date.now();

    // Cleanup database
    try {
        await pool.query(
            'DELETE FROM failed_logins WHERE blocked_until < $1 AND blocked_until > 0',
            [now - 60 * 60 * 1000] // After block expired + 1 hour
        );
    } catch (error) {
        // Silently fail - not critical
    }

    // Cleanup memory store
    for (const [ip, record] of failedLoginsMemory.entries()) {
        if (now > record.blockedUntil + 60 * 60 * 1000) {
            failedLoginsMemory.delete(ip);
        }
    }
}, 5 * 60 * 1000); // Every 5 minutes
