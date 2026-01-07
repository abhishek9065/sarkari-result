import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '../config.js';
import { JwtPayload } from '../types.js';
import { isTokenBlacklisted } from '../utils/security.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Async token authentication middleware
 * Checks database for blacklisted tokens to ensure cross-instance consistency
 */
export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  // Check if token is blacklisted (user logged out)
  // Uses async DB check for multi-instance consistency
  try {
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      res.status(401).json({ error: 'Token has been revoked' });
      return;
    }
  } catch (error) {
    console.error('[Auth] Error checking token blacklist:', error);
    // Continue if blacklist check fails - token validation will still work
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  // Check blacklist for optional auth too (cross-instance consistency)
  try {
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      // For optional auth, we just don't set the user
      next();
      return;
    }
  } catch (error) {
    // Continue without user on blacklist check error
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
  } catch (error) {
    // Invalid token is ignored for optional auth
  }

  next();
}