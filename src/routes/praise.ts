import { UserRole } from '@entities/User';
import { authMiddleware } from '@middleware/auth';
import { Router } from 'express';
import controller from '@controllers/praise';

// Praise-routes
const praiseRouter = Router();
praiseRouter.get('/all', controller.all);
praiseRouter.get('/export', controller.exportPraise);
praiseRouter.get('/:id', controller.single);
praiseRouter.patch(
  '/:id/quantify',
  authMiddleware(UserRole.QUANTIFIER),
  controller.quantify
);

export = praiseRouter;
