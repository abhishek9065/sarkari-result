import { pool } from '../db.js';
import { User } from '../types.js';

export class UserModel {
  static async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const result = await pool.query(
      `SELECT id, email, name, role, password_hash as "passwordHash", 
              created_at as "createdAt", updated_at as "updatedAt" 
       FROM users WHERE email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      passwordHash: row.passwordHash,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }

  static async create(data: { email: string; passwordHash: string; name: string }): Promise<User> {
    const result = await pool.query<User>(
      `INSERT INTO users (email, password_hash, name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, name, role, created_at as "createdAt", updated_at as "updatedAt"`,
      [data.email, data.passwordHash, data.name]
    );
    return result.rows[0];
  }
}