import pool from '../config/database';
import { User } from '../types';

export class UserModel {
  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Find user by invite token
   */
  static async findByInviteToken(token: string): Promise<User | null> {
    const result = await pool.query<User>(
      'SELECT * FROM users WHERE invite_token = $1',
      [token]
    );

    return result.rows[0] || null;
  }

  /**
   * Create new user (with optional invite fields)
   */
  static async create(userData: {
    email: string;
    password_hash?: string;
    first_name: string;
    last_name: string;
    role?: string;
    is_active?: boolean;
    invite_token?: string;
    invite_token_expiry?: Date;
  }): Promise<User> {
    const { 
      email, 
      password_hash = '', 
      first_name, 
      last_name, 
      role = 'user',
      is_active = true,
      invite_token,
      invite_token_expiry
    } = userData;

    const result = await pool.query<User>(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, invite_token, invite_token_expiry)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [email, password_hash, first_name, last_name, role, is_active, invite_token || null, invite_token_expiry || null]
    );

    return result.rows[0];
  }

  /**
   * Update user
   */
  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const fields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = Object.values(updates);

    const result = await pool.query<User>(
      `UPDATE users SET ${fields} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    return result.rows[0] || null;
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
      [email]
    );

    return result.rows[0].exists;
  }
}
