import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
  followUpSchema,
} from '../validations/customer.validation';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// ADMIN and SALES can manage customers; ACCOUNTS can view
router.get(
  '/',
  requireRole('ADMIN', 'SALES', 'ACCOUNTS'),
  validate(customerQuerySchema, 'query'),
  customerController.getAll
);

router.get(
  '/:id',
  requireRole('ADMIN', 'SALES', 'ACCOUNTS'),
  customerController.getById
);

router.post(
  '/',
  requireRole('ADMIN', 'SALES'),
  validate(createCustomerSchema),
  customerController.create
);

router.put(
  '/:id',
  requireRole('ADMIN', 'SALES'),
  validate(updateCustomerSchema),
  customerController.update
);

router.delete(
  '/:id',
  requireRole('ADMIN'),
  customerController.remove
);

// Follow-ups
router.get(
  '/:id/followups',
  requireRole('ADMIN', 'SALES', 'ACCOUNTS'),
  customerController.getFollowUps
);

router.post(
  '/:id/followups',
  requireRole('ADMIN', 'SALES'),
  validate(followUpSchema),
  customerController.addFollowUp
);

export default router;
