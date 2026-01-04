import jwt from 'jsonwebtoken';
import config from '../config/env';
import { UserPayload } from '../types';

/**
 * Generate JWT access token
 */
export const generateAccessToken = (payload: UserPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (payload: UserPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): UserPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as UserPayload;
};
