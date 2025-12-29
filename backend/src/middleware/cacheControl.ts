import { Request, Response, NextFunction } from 'express';

/**
 * Adds Cache-Control headers to GET responses.
 * This enables browser caching for public API endpoints.
 */
export function cacheControl(maxAge: number = 300) {
    return (_req: Request, res: Response, next: NextFunction) => {
        // Only add cache headers for GET requests
        if (_req.method === 'GET') {
            res.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`);
        }
        next();
    };
}

/**
 * Disable caching for sensitive or frequently changing endpoints.
 */
export function noCache(_req: Request, res: Response, next: NextFunction) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
}
