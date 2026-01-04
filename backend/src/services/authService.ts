import { UserModel } from '../models/User';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { User, UserPayload } from '../types';
import emailService from './emailService';
import { randomBytes } from 'crypto';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const { email, password, firstName, lastName } = data;

    // Check if email already exists
    const emailExists = await UserModel.emailExists(email);
    if (emailExists) {
      throw new AppError('Email already in use', 409);
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const user = await UserModel.create({
      email,
      password_hash,
      first_name: firstName,
      last_name: lastName,
    });

    // Generate tokens
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Return user data (without password) and tokens
    return {
      user: this.sanitizeUser(user),
      token,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  static async login(data: { email: string; password: string }) {
    const { email, password } = data;

    console.log('🔐 Login attempt for email:', email);
    console.log('📝 Password received:', password, '(length:', password.length, ')');

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      console.log('❌ User not found');
      throw new AppError('Invalid credentials', 401);
    }

    console.log('✅ User found:', { id: user.id, email: user.email, is_active: user.is_active });
    console.log('💾 Stored hash (first 30 chars):', user.password_hash.substring(0, 30));

    // Check if account is active
    if (!user.is_active) {
      console.log('❌ User is not active');
      throw new AppError('Account is deactivated', 403);
    }

    // Verify password
    console.log('🔑 Verifying password...');
    const isValidPassword = await comparePassword(password, user.password_hash);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Invalid password');
      throw new AppError('Invalid credentials', 401);
    }

    console.log('✅ Login successful');

    // Generate tokens
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: this.sanitizeUser(user),
      token,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Get user to verify they still exist and are active
      const user = await UserModel.findById(payload.id);
      if (!user || !user.is_active) {
        throw new AppError('User not found or inactive', 401);
      }

      // Generate new tokens
      const newPayload: UserPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const newToken = generateAccessToken(newPayload);
      const newRefreshToken = generateRefreshToken(newPayload);

      return {
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.sanitizeUser(user);
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    newPassword: string
  ) {
    // Get user
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await UserModel.update(userId, { password_hash: newPasswordHash });

    return { message: 'Password changed successfully' };
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    updates: {
      first_name?: string;
      last_name?: string;
      avatar_url?: string;
    }
  ) {
    // Get user
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update user
    const updatedUser = await UserModel.update(userId, updates);

    return this.sanitizeUser(updatedUser!);
  }

  /**
   * Get user profile
   */
  static async getProfile(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.sanitizeUser(user);
  }

  /**
   * Get user client IDs
   */
  static async getUserClientIds(userId: string): Promise<string[]> {
    const pool = require('../config/database').default;
    const result = await pool.query(
      'SELECT client_id FROM user_clients WHERE user_id = $1',
      [userId]
    );
    return result.rows.map((row: any) => row.client_id);
  }

  /**
   * Update user client assignments (admin only)
   */
  static async updateUserClients(
    requester: UserPayload,
    userId: string,
    clientIds: string[]
  ): Promise<{ message: string }> {
    // Check if requester is admin
    if (requester.role !== 'admin') {
      throw new AppError('Only admins can modify user client assignments', 403);
    }

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Delete existing client associations
    const pool = require('../config/database').default;
    await pool.query('DELETE FROM user_clients WHERE user_id = $1', [userId]);

    // Add new client associations if provided
    if (clientIds.length > 0) {
      const values = clientIds.map((cid, index) => {
        const paramIndex = index + 2;
        return `($1, $${paramIndex})`;
      }).join(', ');
      const query = `INSERT INTO user_clients (user_id, client_id) VALUES ${values}`;
      await pool.query(query, [userId, ...clientIds]);
    }

    return {
      message: 'User client assignments updated successfully',
    };
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(requester: UserPayload) {
    // Check if requester is admin
    if (requester.role !== 'admin') {
      throw new AppError('Only admins can view all users', 403);
    }

    const pool = require('../config/database').default;
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, role, is_active,
             invite_token IS NOT NULL as is_pending,
             invite_token_expiry,
             created_at
      FROM users
      ORDER BY created_at DESC
    `);

    return result.rows.map((user: any) => ({
      ...user,
      invite_token_expiry: user.invite_token_expiry ? new Date(user.invite_token_expiry) : null,
    }));
  }

  /**
   * Resend invitation (admin only)
   */
  static async resendInvite(
    requester: UserPayload,
    userId: string
  ) {
    // Check if requester is admin
    if (requester.role !== 'admin') {
      throw new AppError('Only admins can resend invitations', 403);
    }

    // Get user
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user is already active
    if (user.is_active) {
      throw new AppError('User is already active', 400);
    }

    // Check if user has an invite token
    if (!user.invite_token) {
      throw new AppError('User does not have a pending invitation', 400);
    }

    // Generate new invite token
    const inviteToken = randomBytes(32).toString('hex');

    // Set token expiry to 7 days from now
    const inviteTokenExpiry = new Date();
    inviteTokenExpiry.setDate(inviteTokenExpiry.getDate() + 7);

    // Update user with new token
    const pool = require('../config/database').default;
    await pool.query(
      `UPDATE users
       SET invite_token = $1, invite_token_expiry = $2
       WHERE id = $3`,
      [inviteToken, inviteTokenExpiry, userId]
    );

    // Get inviter name
    const inviterUser = await UserModel.findById(requester.id);
    const inviterName = `${inviterUser?.first_name || ''} ${inviterUser?.last_name || ''}`.trim() || 'Admin';

    // Send invite email
    await emailService.sendInviteEmail({
      email: user.email,
      inviteToken,
      inviterName,
    });

    return {
      message: 'Invitation resent successfully',
    };
  }

  /**
   * Invite a new user (admin only)
   */
  static async inviteUser(
    inviter: UserPayload,
    data: {
      email: string;
      first_name: string;
      last_name: string;
      role?: 'admin' | 'user';
      client_ids?: string[];
    }
  ) {
    console.log('📧 inviteUser called with data:', data);

    // Check if inviter is admin
    if (inviter.role !== 'admin') {
      throw new AppError('Only admins can invite users', 403);
    }

    const { email, first_name, last_name, role = 'user', client_ids = [] } = data;

    console.log('📧 Extracted client_ids:', client_ids);

    // Check if email already exists
    const emailExists = await UserModel.emailExists(email);
    if (emailExists) {
      throw new AppError('Email already in use', 409);
    }

    // Generate invite token (32 bytes = 64 hex chars)
    const inviteToken = randomBytes(32).toString('hex');

    // Set token expiry to 7 days from now
    const inviteTokenExpiry = new Date();
    inviteTokenExpiry.setDate(inviteTokenExpiry.getDate() + 7);

    // Create user with invite token (not active yet, no password)
    const user = await UserModel.create({
      email,
      first_name,
      last_name,
      role,
      invite_token: inviteToken,
      invite_token_expiry: inviteTokenExpiry,
      is_active: false,
    });

    // Associate user with clients if provided
    console.log('🔗 Inviting user with client_ids:', client_ids);
    if (client_ids.length > 0) {
      const pool = require('../config/database').default;
      const values = client_ids.map((cid, index) => {
        const paramIndex = index + 2;
        return `($1, $${paramIndex})`;
      }).join(', ');
      const query = `INSERT INTO user_clients (user_id, client_id) VALUES ${values}`;
      console.log('📝 Insert query:', query);
      console.log('📝 Params:', [user.id, ...client_ids]);
      await pool.query(query, [user.id, ...client_ids]);
      console.log('✅ User clients inserted successfully');
    } else {
      console.log('⚠️ No client_ids provided, skipping client association');
    }

    // Send invite email
    const inviterUser = await UserModel.findById(inviter.id);
    const inviterName = `${inviterUser?.first_name || ''} ${inviterUser?.last_name || ''}`.trim() || 'Admin';

    await emailService.sendInviteEmail({
      email,
      inviteToken,
      inviterName,
    });

    return {
      message: 'User invited successfully',
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Delete a user (admin only)
   */
  static async deleteUser(
    requester: UserPayload,
    userId: string
  ) {
    // Check if requester is admin
    if (requester.role !== 'admin') {
      throw new AppError('Only admins can delete users', 403);
    }

    // Prevent deleting yourself
    if (requester.id === userId) {
      throw new AppError('You cannot delete your own account', 400);
    }

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Delete user (CASCADE will handle related records)
    const pool = require('../config/database').default;
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    return {
      message: 'User deleted successfully',
    };
  }

  /**
   * Accept invitation and set password
   */
  static async acceptInvitation(data: {
    token: string;
    password: string;
  }) {
    const { token, password } = data;

    console.log('🔍 Looking up invite token:', token);

    // Find user by invite token
    const user = await UserModel.findByInviteToken(token);

    console.log('👤 User found:', user ? `ID: ${user.id}, Email: ${user.email}` : 'NOT FOUND');

    if (!user) {
      throw new AppError('Invalid or expired invitation', 400);
    }

    // Check if token is expired
    if (user.invite_token_expiry && new Date(user.invite_token_expiry) < new Date()) {
      throw new AppError('Invitation has expired', 400);
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Update user: set password, mark as active, clear invite token
    const pool = require('../config/database').default;
    await pool.query(
      `UPDATE users 
       SET password_hash = $1, is_active = true, invite_token = NULL, invite_token_expiry = NULL 
       WHERE id = $2`,
      [password_hash, user.id]
    );

    // Get updated user
    const updatedUser = await UserModel.findById(user.id);
    if (!updatedUser) {
      throw new AppError('Failed to activate account', 500);
    }

    // Generate tokens
    const payload: UserPayload = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    console.log('✅ Invitation accepted successfully for user:', updatedUser.email);

    return {
      user: this.sanitizeUser(updatedUser),
      token: accessToken,
      refreshToken,
    };
  }

  /**
   * Remove sensitive fields from user object
   */
  private static sanitizeUser(user: User) {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}
