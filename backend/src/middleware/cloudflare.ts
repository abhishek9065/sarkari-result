import { Request, Response, NextFunction } from 'express';

/**
 * Cloudflare IP Ranges (IPv4)
 * These are the IP ranges that Cloudflare uses to proxy requests.
 * Updated: 2024 - Check https://www.cloudflare.com/ips/ for latest
 */
const CLOUDFLARE_IP_RANGES = [
    '173.245.48.0/20',
    '103.21.244.0/22',
    '103.22.200.0/22',
    '103.31.4.0/22',
    '141.101.64.0/18',
    '108.162.192.0/18',
    '190.93.240.0/20',
    '188.114.96.0/20',
    '197.234.240.0/22',
    '198.41.128.0/17',
    '162.158.0.0/15',
    '104.16.0.0/13',
    '104.24.0.0/14',
    '172.64.0.0/13',
    '131.0.72.0/22',
];

function normalizeIp(ip: string): string {
    if (!ip) return '';
    if (ip.startsWith('::ffff:')) return ip.slice(7);
    if (ip === '::1') return '127.0.0.1';
    const zoneIndex = ip.indexOf('%');
    return zoneIndex > -1 ? ip.slice(0, zoneIndex) : ip;
}

/**
 * Check if an IP is within a CIDR range
 */
function ipInRange(ip: string, cidr: string): boolean {
    const [range, bits] = cidr.split('/');
    const mask = ~(2 ** (32 - parseInt(bits)) - 1);

    const ipParts = ip.split('.').map(Number);
    const rangeParts = range.split('.').map(Number);

    const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
    const rangeNum = (rangeParts[0] << 24) | (rangeParts[1] << 16) | (rangeParts[2] << 8) | rangeParts[3];

    return (ipNum & mask) === (rangeNum & mask);
}

/**
 * Check if request comes from Cloudflare
 */
export function isCloudflareRequest(ip: string): boolean {
    // Skip IPv6 for now (simplified)
    if (ip.includes(':')) return false;

    return CLOUDFLARE_IP_RANGES.some(range => ipInRange(ip, range));
}

/**
 * Middleware to extract real client IP from Cloudflare headers
 * 
 * Cloudflare adds these headers:
 * - CF-Connecting-IP: The real client IP
 * - CF-IPCountry: Country code (e.g., "US", "IN")
 * - CF-RAY: Request ID for debugging
 */
export function cloudflareMiddleware() {
    return (req: Request, _res: Response, next: NextFunction) => {
        // Get the connecting IP (immediate connection)
        const connectingIp = normalizeIp(req.socket.remoteAddress || '');

        // Check if request comes from Cloudflare
        const cfConnectingIp = req.headers['cf-connecting-ip'] as string;
        const cfCountry = req.headers['cf-ipcountry'] as string;
        const cfRay = req.headers['cf-ray'] as string;

        if (cfConnectingIp && isCloudflareRequest(connectingIp)) {
            // Override req.ip with real client IP
            // Note: Express uses req.ip which considers trust proxy
            // We attach the real IP to a custom property for clarity
            (req as any).realIp = cfConnectingIp;
            (req as any).cfCountry = cfCountry;
            (req as any).cfRay = cfRay;
            (req as any).isCloudflare = true;
        } else {
            // Not through Cloudflare (direct access or local dev)
            (req as any).realIp = req.ip || connectingIp;
            (req as any).isCloudflare = false;
            if (cfConnectingIp) {
                console.warn('[Cloudflare] Ignored spoofed CF-Connecting-IP header');
            }
        }

        next();
    };
}

/**
 * Get the real client IP from request
 * Use this instead of req.ip when you need the actual client IP
 */
export function getRealIp(req: Request): string {
    return (req as any).realIp || req.ip || 'unknown';
}

/**
 * Get Cloudflare country code from request
 */
export function getCountry(req: Request): string | undefined {
    return (req as any).cfCountry;
}

export default cloudflareMiddleware;
