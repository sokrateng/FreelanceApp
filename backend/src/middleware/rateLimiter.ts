import rateLimit from 'express-rate-limit';
import config from '../config/env';

/**
 * General API rate limiter
 * Limits each IP to max requests per time window
 */
export const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5000, // 5000 requests per 5 minutes
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

/**
 * Stricter rate limiter for auth endpoints
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5000, // 5000 requests per 5 minutes
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false, // Count failed requests
  message: {
    success: false,
    error: 'Too many login attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
