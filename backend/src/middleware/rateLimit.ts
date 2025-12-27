import { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiter
const requestCounts = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
    windowMs?: number;  // Time window in milliseconds
    maxRequests?: number;  // Max requests per window
}

export function rateLimit(options: RateLimitOptions = {}) {
    const windowMs = options.windowMs || 60000; // 1 minute default
    const maxRequests = options.maxRequests || 100; // 100 requests default

    return (req: Request, res: Response, next: NextFunction) => {
        const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();

        const clientData = requestCounts.get(clientIp);

        if (!clientData || now > clientData.resetTime) {
            // New window
            requestCounts.set(clientIp, {
                count: 1,
                resetTime: now + windowMs,
            });
            return next();
        }

        if (clientData.count >= maxRequests) {
            // Rate limit exceeded
            res.status(429).json({
                error: 'Too many requests',
                retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
            });
            return;
        }

        // Increment count
        clientData.count++;
        next();
    };
}

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of requestCounts.entries()) {
        if (now > data.resetTime) {
            requestCounts.delete(ip);
        }
    }
}, 60000); // Clean up every minute

export default rateLimit;
