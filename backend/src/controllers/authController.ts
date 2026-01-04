import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  static register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, firstName, lastName } = req.body;

    const result = await AuthService.register({
      email,
      password,
      firstName,
      lastName,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  });

  /**
   * Login user
   * POST /api/auth/login
   */
  static login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const result = await AuthService.login({ email, password });

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * Refresh access token
   * POST /api/auth/refresh-token
   */
  static refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    const result = await AuthService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * Get current user
   * GET /api/auth/me
   */
  static me = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    const user = await AuthService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * Change password
   * PUT /api/auth/change-password
   */
  static changePassword = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { newPassword } = req.body;

    const result = await AuthService.changePassword(userId, newPassword);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * Get user profile
   * GET /api/auth/profile
   */
  static getProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;

    const user = await AuthService.getProfile(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  static updateProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { first_name, last_name, avatar_url } = req.body;

    const user = await AuthService.updateProfile(userId, {
      first_name,
      last_name,
      avatar_url,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * Logout user (client-side only)
   * POST /api/auth/logout
   */
  static logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // In JWT-based auth, logout is handled client-side by removing the token
    // This endpoint is here for consistency, but doesn't need to do anything server-side
    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  });

  /**
   * Invite a new user (admin only)
   * POST /api/auth/invite
   */
  static inviteUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user!;
    const { email, first_name, last_name, role, client_ids } = req.body;

    const result = await AuthService.inviteUser(user, {
      email,
      first_name,
      last_name,
      role,
      client_ids,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  });

  /**
   * Get all users (admin only)
   * GET /api/auth/users
   */
  static getAllUsers = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user!;

    const users = await AuthService.getAllUsers(user);

    res.status(200).json({
      success: true,
      data: users,
    });
  });

  /**
   * Resend invitation (admin only)
   * POST /api/auth/users/:id/resend-invite
   */
  static resendInvite = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user!;
    const { id } = req.params;

    const result = await AuthService.resendInvite(user, id);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * Accept invitation and set password
   * POST /api/auth/accept-invitation
   */
  static acceptInvitation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { token, password } = req.body;

    const result = await AuthService.acceptInvitation({ token, password });

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * Get user client IDs
   * GET /api/auth/:userId/clients
   */
  static getUserClients = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const requester = req.user!;
    const { userId } = req.params;

    // Only admin or the user themselves can view their client assignments
    if (requester.role !== 'admin' && requester.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const clientIds = await AuthService.getUserClientIds(userId);

    res.status(200).json({
      success: true,
      data: { client_ids: clientIds },
    });
  });

  /**
   * Update user client assignments (admin only)
   * PUT /api/auth/:userId/clients
   */
  static updateUserClients = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { client_ids } = req.body;

    const result = await AuthService.updateUserClients(req.user!, userId, client_ids);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * Delete a user (admin only)
   * DELETE /api/auth/:userId
   */
  static deleteUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const result = await AuthService.deleteUser(req.user!, userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  });
}
