import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Comprehensive security middleware
 * Applies multiple security layers to protect against common attacks
 */

// Failed login tracking for brute-force protection
const failedLogins = new Map<string, { count: number; blockedUntil: number }>();

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
 */
export function bruteForceProtection(req: Request, res: Response, next: NextFunction) {
    const ip = getClientIP(req);
    const now = Date.now();

    const record = failedLogins.get(ip);

    if (record && now < record.blockedUntil) {
        const waitTime = Math.ceil((record.blockedUntil - now) / 1000 / 60);
        return res.status(429).json({
            error: 'Too many failed login attempts',
            message: `Please try again in ${waitTime} minutes`,
            blockedUntil: record.blockedUntil
        });
    }

    next();
}

/**
 * Record failed login attempt
 * Call this after a failed login
 */
export function recordFailedLogin(ip: string) {
    const now = Date.now();
    const record = failedLogins.get(ip);

    if (!record) {
        failedLogins.set(ip, { count: 1, blockedUntil: 0 });
    } else {
        record.count++;
        // Block after 5 failed attempts for 15 minutes
        if (record.count >= 5) {
            record.blockedUntil = now + 15 * 60 * 1000; // 15 minutes
            console.log(`[SECURITY] IP ${ip} blocked for 15 minutes due to failed login attempts`);
        }
    }
}

/**
 * Clear failed login record on successful login
 */
export function clearFailedLogins(ip: string) {
    failedLogins.delete(ip);
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
 * Sanitize object recursively
 */
export function sanitizeObject<T extends object>(obj: T): T {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            result[key] = sanitizeInput(value);
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = sanitizeObject(value);
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

// Cleanup old blocked IPs periodically
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of failedLogins.entries()) {
        if (now > record.blockedUntil + 60 * 60 * 1000) { // Keep for 1 hour after block expires
            failedLogins.delete(ip);
        }
    }
}, 5 * 60 * 1000); // Every 5 minutes
