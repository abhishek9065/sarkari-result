import crypto from 'crypto';

/**
 * Token blacklist for invalidated JWTs (logout, password change)
 * In production, use Redis for distributed blacklist
 */
const tokenBlacklist = new Set<string>();

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
 */
export function blacklistToken(token: string): void {
    // Hash the token for storage (don't store actual token)
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    tokenBlacklist.add(hashedToken);

    console.log(`[SECURITY] Token blacklisted`);
}

/**
 * Check if token is blacklisted
 */
export function isTokenBlacklisted(token: string): boolean {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return tokenBlacklist.has(hashedToken);
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
    /(--|\#|\/\*)/,

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

// Cleanup old blacklist entries periodically (tokens expire anyway)
setInterval(() => {
    // In production, implement expiry-based cleanup
    // For now, clear if too large (tokens expire with JWT anyway)
    if (tokenBlacklist.size > 10000) {
        tokenBlacklist.clear();
        console.log('[SECURITY] Cleared token blacklist');
    }
}, 60 * 60 * 1000); // Every hour
