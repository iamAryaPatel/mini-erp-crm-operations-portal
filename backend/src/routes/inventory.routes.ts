import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createMovementSchema, movementQuerySchema } from '../validations/inventory.validation';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  inventoryController.getStats
);

router.get(
  '/low-stock',
  requireRole('ADMIN', 'WAREHOUSE'),
  inventoryController.getLowStock
);

router.get(
  '/movements',
  requireRole('ADMIN', 'WAREHOUSE', 'ACCOUNTS'),
  validate(movementQuerySchema, 'query'),
  inventoryController.getMovements
);

router.post(
  '/movements',
  requireRole('ADMIN', 'WAREHOUSE'),
  validate(createMovementSchema),
  inventoryController.addMovement
);

export default router;
