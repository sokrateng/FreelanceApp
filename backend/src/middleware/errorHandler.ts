import { Request, Response, NextFunction } from 'express';
import config from '../config/env';

// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  console.error('❌ Error:', {
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  // Handle known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // Handle database errors
  if (err.message.includes('duplicate key')) {
    return res.status(409).json({
      success: false,
      error: 'Resource already exists',
    });
  }

  // Default to 500 server error
  res.status(500).json({
    success: false,
    error: config.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message,
  });
};

// Async handler wrapper to catch errors in async route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
