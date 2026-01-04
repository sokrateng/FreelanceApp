import Joi from 'joi';

export const createClientSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required().messages({
    'string.empty': 'Client name is required',
    'string.min': 'Client name must be at least 2 characters',
    'string.max': 'Client name must not exceed 255 characters',
    'any.required': 'Client name is required',
  }),
  email: Joi.string().trim().email().max(255).optional().allow('', null).messages({
    'string.email': 'Invalid email format',
    'string.max': 'Email must not exceed 255 characters',
  }),
  phone: Joi.string().trim().max(50).optional().allow('', null).messages({
    'string.max': 'Phone must not exceed 50 characters',
  }),
  company: Joi.string().trim().max(255).optional().allow('', null).messages({
    'string.max': 'Company name must not exceed 255 characters',
  }),
  address: Joi.string().trim().optional().allow('', null),
  status: Joi.string()
    .valid('active', 'inactive', 'archived')
    .optional()
    .default('active')
    .messages({
      'any.only': 'Status must be one of: active, inactive, archived',
    }),
  notes: Joi.string().trim().optional().allow('', null),
});

export const updateClientSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).optional().messages({
    'string.empty': 'Client name cannot be empty',
    'string.min': 'Client name must be at least 2 characters',
    'string.max': 'Client name must not exceed 255 characters',
  }),
  email: Joi.string().trim().email().max(255).optional().allow('', null).messages({
    'string.email': 'Invalid email format',
    'string.max': 'Email must not exceed 255 characters',
  }),
  phone: Joi.string().trim().max(50).optional().allow('', null).messages({
    'string.max': 'Phone must not exceed 50 characters',
  }),
  company: Joi.string().trim().max(255).optional().allow('', null).messages({
    'string.max': 'Company name must not exceed 255 characters',
  }),
  address: Joi.string().trim().optional().allow('', null),
  status: Joi.string()
    .valid('active', 'inactive', 'archived')
    .optional()
    .messages({
      'any.only': 'Status must be one of: active, inactive, archived',
    }),
  notes: Joi.string().trim().optional().allow('', null),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

export const clientQuerySchema = Joi.object({
  status: Joi.string()
    .valid('active', 'inactive', 'archived')
    .optional()
    .messages({
      'any.only': 'Status must be one of: active, inactive, archived',
    }),
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.base': 'Page must be a number',
    'number.min': 'Page must be at least 1',
  }),
  limit: Joi.number().integer().min(1).max(100).optional().default(10).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 100',
  }),
});
