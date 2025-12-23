import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { config } from '../config.js';
import { UserModel } from '../models/users.js';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

router.post('/register', async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await UserModel.findByEmail(validated.email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);
    const user = await UserModel.create({
      email: validated.email,
      passwordHash,
      name: validated.name
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ data: { user, token } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.flatten() });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/login', async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);

    const userWithHash = await UserModel.findByEmail(validated.email);
    if (!userWithHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(validated.password, userWithHash.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: userWithHash.id, email: userWithHash.email, role: userWithHash.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

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