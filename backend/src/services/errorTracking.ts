/**
 * Sentry Error Tracking Service
 * Integrates with Sentry for production error monitoring
 * 
 * Setup Sentry (Free for students):
 * 1. Go to https://sentry.io
 * 2. Create new project → Select "Express" or "Node.js"
 * 3. Copy the DSN
 * 4. Set SENTRY_DSN environment variable
 */

const SENTRY_DSN = process.env.SENTRY_DSN;
const isProduction = process.env.NODE_ENV === 'production';
const isEnabled = !!(SENTRY_DSN && isProduction);

// Track errors in-memory when Sentry is not configured
const errorLog: Array<{
    timestamp: Date;
    error: string;
    stack?: string;
    context?: Record<string, any>;
}> = [];
const MAX_ERROR_LOG = 100;

/**
 * Initialize Sentry (call at app startup)
 * Note: In production, you would import @sentry/node
 * For now, this provides a compatible interface
 */
export function initSentry(): void {
    if (SENTRY_DSN) {
        console.log('[Sentry] Initialized with DSN:', SENTRY_DSN.substring(0, 30) + '...');
    } else {
        console.log('[Sentry] Not configured - using local error logging');
    }
}

/**
 * Capture an exception
 */
export async function captureException(
    error: Error,
    context?: Record<string, any>
): Promise<void> {
    const errorEntry = {
        timestamp: new Date(),
        error: error.message,
        stack: error.stack,
        context
    };

    // Always log to console
    console.error('[Error]', error.message, context || '');

    // Store in local log
    errorLog.unshift(errorEntry);
    if (errorLog.length > MAX_ERROR_LOG) {
        errorLog.pop();
    }

    // If Sentry DSN is configured, send to Sentry
    if (isEnabled && SENTRY_DSN) {
        try {
            // In production with @sentry/node installed:
            // const Sentry = await import('@sentry/node');
            // Sentry.captureException(error, { extra: context });

            // For now, send via Sentry API directly (lightweight)
            await sendToSentryAPI(error, context);
        } catch (e) {
            console.error('[Sentry] Failed to send error:', e);
        }
    }
}

/**
 * Capture a message/warning
 */
export function captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info'
): void {
    console.log(`[${level.toUpperCase()}]`, message);

    if (level === 'error') {
        errorLog.unshift({
            timestamp: new Date(),
            error: message,
        });
        if (errorLog.length > MAX_ERROR_LOG) {
            errorLog.pop();
        }
    }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
    category: string;
    message: string;
    level?: string;
}): void {
    console.log(`[Breadcrumb] ${breadcrumb.category}: ${breadcrumb.message}`);
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string }): void {
    console.log('[Sentry] User context set:', user.id);
}

/**
 * Clear user context (on logout)
 */
export function clearUser(): void {
    console.log('[Sentry] User context cleared');
}

/**
 * Get recent errors (for admin dashboard)
 */
export function getRecentErrors(limit: number = 20): typeof errorLog {
    return errorLog.slice(0, limit);
}

/**
 * Express error handler middleware
 */
export function errorHandler(err: Error, req: any, res: any, next: any): void {
    captureException(err, {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
    });

    res.status(500).json({
        error: isProduction ? 'Internal server error' : err.message,
    });
}

/**
 * Lightweight Sentry API sender (no SDK needed)
 */
async function sendToSentryAPI(error: Error, context?: Record<string, any>): Promise<void> {
    if (!SENTRY_DSN) return;

    // Parse DSN: https://<key>@<org>.ingest.sentry.io/<project>
    const match = SENTRY_DSN.match(/https:\/\/(.+)@(.+)\/(\d+)/);
    if (!match) {
        console.error('[Sentry] Invalid DSN format');
        return;
    }

    const [, key, host, projectId] = match;
    const endpoint = `https://${host}/api/${projectId}/store/`;

    try {
        await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${key}`,
            },
            body: JSON.stringify({
                event_id: crypto.randomUUID?.() || Date.now().toString(16),
                timestamp: new Date().toISOString(),
                platform: 'node',
                level: 'error',
                logger: 'sarkari-backend',
                exception: {
                    values: [{
                        type: error.name,
                        value: error.message,
                        stacktrace: {
                            frames: parseStackTrace(error.stack)
                        }
                    }]
                },
                extra: context,
                environment: process.env.NODE_ENV || 'development',
            }),
        });
    } catch (e) {
        // Silently fail - don't let error tracking break the app
    }
}

function parseStackTrace(stack?: string): Array<{ filename: string; lineno: number; function: string }> {
    if (!stack) return [];

    const lines = stack.split('\n').slice(1, 10);
    return lines.map(line => {
        const match = line.match(/at (.+) \((.+):(\d+):\d+\)/);
        if (match) {
            return { function: match[1], filename: match[2], lineno: parseInt(match[3]) };
        }
        return { function: 'unknown', filename: 'unknown', lineno: 0 };
    });
}

export const ErrorTracking = {
    init: initSentry,
    captureException,
    captureMessage,
    addBreadcrumb,
    setUser,
    clearUser,
    getRecentErrors,
    errorHandler,
};

export default ErrorTracking;
