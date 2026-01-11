import express from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { config } from '../config.js';
import { UserModelMongo } from '../models/users.mongo.js';
import {
  bruteForceProtection,
  recordFailedLogin,
  clearFailedLogins,
  getClientIP
} from '../middleware/security.js';
import { blacklistToken, logSecurityEvent } from '../utils/security.js';

const router = express.Router();

// Password strength requirements
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const registerSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: passwordSchema,
  name: z.string().min(2).max(100).trim(),
});

// Security: Shorter JWT expiry (1 day instead of 7)
const JWT_EXPIRY = '1d';

router.post('/register', async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await UserModelMongo.findByEmail(validated.email);
    if (existingUser) {
      // Security: Don't reveal if email exists - use generic message
      return res.status(400).json({ error: 'Registration failed. Please try again.' });
    }

    // Create user with MongoDB model
    const user = await UserModelMongo.create({
      email: validated.email,
      username: validated.name, // MongoDB uses 'username' instead of 'name'
      password: validated.password, // MongoDB model hashes password internally
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: JWT_EXPIRY }
    );

    // Security: Don't return sensitive data
    return res.status(201).json({
      data: {
        user: { id: user.id, email: user.email, name: user.username, role: user.role },
        token
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.flatten() });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string(),
});

// Apply brute-force protection to login
router.post('/login', bruteForceProtection, async (req, res) => {
  const clientIP = getClientIP(req);

  try {
    const validated = loginSchema.parse(req.body);

    // Use verifyPassword method which handles password comparison internally
    const user = await UserModelMongo.verifyPassword(validated.email, validated.password);

    if (!user) {
      // Security: Record failed attempt but don't reveal if email exists
      recordFailedLogin(clientIP);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Clear failed login attempts on success
    clearFailedLogins(clientIP);

    // Log successful login for audit
    logSecurityEvent('LOGIN_SUCCESS', clientIP, req.headers['user-agent'] || '');

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: JWT_EXPIRY }
    );

    return res.json({
      data: {
        user: { id: user.id, email: user.email, name: user.username, role: user.role },
        token
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.flatten() });
    }
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Logout endpoint - blacklist the token
router.post('/logout', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    // Wait for token to be blacklisted in DB before responding
    // This prevents race condition where token could still be valid briefly
    await blacklistToken(token);
    const clientIP = getClientIP(req);
    logSecurityEvent('LOGOUT', clientIP, req.headers['user-agent'] || '');
  }

  return res.json({ message: 'Logged out successfully' });
});

export default router;