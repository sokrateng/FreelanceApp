import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

/**
 * Validation middleware factory
 * Validates request body, query, or params against a Joi schema
 */
export const validateRequest = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');

      return next(new AppError(errorMessage, 400));
    }

    // Replace request data with validated value
    req[property] = value;
    next();
  };
};

// Common validation patterns
export const validationPatterns = {
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  uuid: Joi.string().uuid().required(),
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  },
};
