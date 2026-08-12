import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../validations/product.validation';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  validate(productQuerySchema, 'query'),
  productController.getAll
);

router.get(
  '/categories',
  requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  productController.getCategories
);

router.get(
  '/:id',
  requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  productController.getById
);

router.post(
  '/',
  requireRole('ADMIN', 'WAREHOUSE'),
  validate(createProductSchema),
  productController.create
);

router.put(
  '/:id',
  requireRole('ADMIN', 'WAREHOUSE'),
  validate(updateProductSchema),
  productController.update
);

export default router;
