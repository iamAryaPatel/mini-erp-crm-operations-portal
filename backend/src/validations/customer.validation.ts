import Joi from 'joi';

export const createCustomerSchema = Joi.object({
  customer_name: Joi.string().max(150).required().messages({
    'any.required': 'Customer name is required',
  }),
  mobile_number: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Mobile number must be 10-15 digits',
      'any.required': 'Mobile number is required',
    }),
  email: Joi.string().email().allow('', null).optional().messages({
    'string.email': 'Please provide a valid email address',
  }),
  business_name: Joi.string().max(200).required().messages({
    'any.required': 'Business name is required',
  }),
  gst_number: Joi.string().max(15).allow('', null).optional(),
  customer_type: Joi.string()
    .valid('Retail', 'Wholesale', 'Distributor')
    .required()
    .messages({
      'any.only': 'Customer type must be Retail, Wholesale, or Distributor',
      'any.required': 'Customer type is required',
    }),
  address: Joi.string().allow('', null).optional(),
  status: Joi.string()
    .valid('Lead', 'Active', 'Inactive')
    .default('Lead')
    .messages({
      'any.only': 'Status must be Lead, Active, or Inactive',
    }),
  follow_up_date: Joi.date().iso().allow(null).optional(),
  notes: Joi.string().allow('', null).optional(),
});

export const updateCustomerSchema = Joi.object({
  customer_name: Joi.string().max(150).optional(),
  mobile_number: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Mobile number must be 10-15 digits',
    }),
  email: Joi.string().email().allow('', null).optional(),
  business_name: Joi.string().max(200).optional(),
  gst_number: Joi.string().max(15).allow('', null).optional(),
  customer_type: Joi.string()
    .valid('Retail', 'Wholesale', 'Distributor')
    .optional(),
  address: Joi.string().allow('', null).optional(),
  status: Joi.string()
    .valid('Lead', 'Active', 'Inactive')
    .optional(),
  follow_up_date: Joi.date().iso().allow(null).optional(),
  notes: Joi.string().allow('', null).optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

export const customerQuerySchema = Joi.object({
  search: Joi.string().allow('').optional(),
  status: Joi.string().valid('Lead', 'Active', 'Inactive').optional(),
  customer_type: Joi.string().valid('Retail', 'Wholesale', 'Distributor').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const followUpSchema = Joi.object({
  note: Joi.string().required().messages({
    'any.required': 'Follow-up note is required',
  }),
  follow_up_date: Joi.date().iso().allow(null).optional(),
});
