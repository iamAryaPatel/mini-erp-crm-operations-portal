import Joi from 'joi';

export const createProductSchema = Joi.object({
  product_name: Joi.string().max(200).required().messages({
    'any.required': 'Product name is required',
  }),
  sku: Joi.string().max(50).required().messages({
    'any.required': 'SKU is required',
  }),
  category: Joi.string().max(100).required().messages({
    'any.required': 'Category is required',
  }),
  unit_price: Joi.number().min(0).required().messages({
    'number.min': 'Unit price cannot be negative',
    'any.required': 'Unit price is required',
  }),
  current_stock: Joi.number().integer().min(0).default(0).messages({
    'number.min': 'Stock cannot be negative',
  }),
  minimum_stock_quantity: Joi.number().integer().min(0).default(0).messages({
    'number.min': 'Minimum stock quantity cannot be negative',
  }),
  warehouse_location: Joi.string().max(100).allow('', null).optional(),
});

export const updateProductSchema = Joi.object({
  product_name: Joi.string().max(200).optional(),
  sku: Joi.string().max(50).optional(),
  category: Joi.string().max(100).optional(),
  unit_price: Joi.number().min(0).optional(),
  minimum_stock_quantity: Joi.number().integer().min(0).optional(),
  warehouse_location: Joi.string().max(100).allow('', null).optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

export const productQuerySchema = Joi.object({
  search: Joi.string().allow('').optional(),
  category: Joi.string().optional(),
  low_stock: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});
