import controller from '@controllers/praise';
import { UserRole } from '@entities/User';
import { authMiddleware } from '@middleware/auth';
import { Router } from 'express';

const praiseRouter = Router();

praiseRouter.get(
  '/import',
  authMiddleware(UserRole.ADMIN),
  controller.importData
);

export = praiseRouter;
