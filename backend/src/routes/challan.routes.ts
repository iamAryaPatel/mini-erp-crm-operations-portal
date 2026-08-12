import { Router } from 'express';
import * as challanController from '../controllers/challan.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createChallanSchema, challanQuerySchema } from '../validations/challan.validation';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requireRole('ADMIN', 'SALES', 'ACCOUNTS'),
  validate(challanQuerySchema, 'query'),
  challanController.getAll
);

router.get(
  '/:id',
  requireRole('ADMIN', 'SALES', 'ACCOUNTS'),
  challanController.getById
);

router.post(
  '/',
  requireRole('ADMIN', 'SALES'),
  validate(createChallanSchema),
  challanController.create
);

router.post(
  '/:id/confirm',
  requireRole('ADMIN', 'SALES'),
  challanController.confirm
);

router.post(
  '/:id/cancel',
  requireRole('ADMIN', 'SALES'),
  challanController.cancel
);

export default router;
