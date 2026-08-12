import Joi from 'joi';

const challanItemSchema = Joi.object({
  product_id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid product ID format',
    'any.required': 'Product ID is required for each item',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required for each item',
  }),
});

export const createChallanSchema = Joi.object({
  customer_id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid customer ID format',
    'any.required': 'Customer is required',
  }),
  items: Joi.array().items(challanItemSchema).min(1).required().messages({
    'array.min': 'At least one product is required',
    'any.required': 'Challan items are required',
  }),
});

export const challanQuerySchema = Joi.object({
  search: Joi.string().allow('').optional(),
  status: Joi.string().valid('Draft', 'Confirmed', 'Cancelled').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});
