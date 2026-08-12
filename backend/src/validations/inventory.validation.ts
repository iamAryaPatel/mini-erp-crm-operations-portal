import Joi from 'joi';

export const createMovementSchema = Joi.object({
  product_id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid product ID format',
    'any.required': 'Product ID is required',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required',
  }),
  movement_type: Joi.string().valid('IN', 'OUT').required().messages({
    'any.only': 'Movement type must be IN or OUT',
    'any.required': 'Movement type is required',
  }),
  reason: Joi.string().max(255).required().messages({
    'any.required': 'Reason is required',
  }),
});

export const movementQuerySchema = Joi.object({
  product_id: Joi.string().uuid().optional(),
  movement_type: Joi.string().valid('IN', 'OUT').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
