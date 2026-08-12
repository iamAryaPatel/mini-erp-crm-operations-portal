import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { loginSchema } from '../validations/auth.validation';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);

export default router;
