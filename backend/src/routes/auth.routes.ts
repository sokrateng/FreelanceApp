import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest } from '../middleware/validation';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '../validators/authValidator';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  validateRequest(registerSchema),
  AuthController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  AuthController.login
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh-token',
  validateRequest(refreshTokenSchema),
  AuthController.refreshToken
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, AuthController.me);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  '/change-password',
  authenticate,
  validateRequest(changePasswordSchema),
  AuthController.changePassword
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticate, AuthController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, AuthController.updateProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', AuthController.logout);

/**
 * @route   POST /api/auth/invite
 * @desc    Invite a new user (admin only)
 * @access  Private (Admin)
 */
router.post('/invite', authenticate, AuthController.inviteUser);

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get('/users', authenticate, AuthController.getAllUsers);

/**
 * @route   POST /api/auth/users/:id/resend-invite
 * @desc    Resend invitation (admin only)
 * @access  Private (Admin)
 */
router.post('/users/:id/resend-invite', authenticate, AuthController.resendInvite);

/**
 * @route   POST /api/auth/accept-invitation
 * @desc    Accept invitation and set password
 * @access  Public
 */
router.post('/accept-invitation', AuthController.acceptInvitation);

/**
 * @route   GET /api/auth/:userId/clients
 * @desc    Get user client IDs
 * @access  Private (Admin or self)
 */
router.get('/:userId/clients', authenticate, AuthController.getUserClients);

/**
 * @route   PUT /api/auth/:userId/clients
 * @desc    Update user client assignments (admin only)
 * @access  Private (Admin)
 */
router.put('/:userId/clients', authenticate, AuthController.updateUserClients);

/**
 * @route   DELETE /api/auth/:userId
 * @desc    Delete a user (admin only)
 * @access  Private (Admin)
 */
router.delete('/:userId', authenticate, AuthController.deleteUser);

export default router;
