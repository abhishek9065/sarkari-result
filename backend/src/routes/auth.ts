import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { config } from '../config.js';
import { UserModel } from '../models/users.js';
import {
  bruteForceProtection,
  recordFailedLogin,
  clearFailedLogins,
  getClientIP
} from '../middleware/security.js';

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

// Security: Use higher bcrypt rounds (12 is more secure than 10)
const BCRYPT_ROUNDS = 12;

// Security: Shorter JWT expiry (1 day instead of 7)
const JWT_EXPIRY = '1d';

router.post('/register', async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await UserModel.findByEmail(validated.email);
    if (existingUser) {
      // Security: Don't reveal if email exists - use generic message
      return res.status(400).json({ error: 'Registration failed. Please try again.' });
    }

    // Use stronger bcrypt rounds
    const passwordHash = await bcrypt.hash(validated.password, BCRYPT_ROUNDS);
    const user = await UserModel.create({
      email: validated.email,
      passwordHash,
      name: validated.name
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: JWT_EXPIRY }
    );

    // Security: Don't return sensitive data
    return res.status(201).json({
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
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

    const userWithHash = await UserModel.findByEmail(validated.email);
    if (!userWithHash) {
      // Security: Record failed attempt but don't reveal if email exists
      recordFailedLogin(clientIP);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(validated.password, userWithHash.passwordHash);
    if (!isPasswordValid) {
      recordFailedLogin(clientIP);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Clear failed login attempts on success
    clearFailedLogins(clientIP);

    const token = jwt.sign(
      { userId: userWithHash.id, email: userWithHash.email, role: userWithHash.role },
      config.jwtSecret,
      { expiresIn: JWT_EXPIRY }
    );

    // Security: Never return password hash
    const { passwordHash, ...user } = userWithHash;
    return res.json({ data: { user, token } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.flatten() });
    }
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

export default router;