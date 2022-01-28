import controller from '@praise/controllers';
import { UserRole } from '@entities/User';
import { authMiddleware } from '@auth/middleware';
import { Router } from 'express';

const praiseAdminRouter = Router();
praiseAdminRouter.get('/import', controller.importData);

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

export { praiseRouter, praiseAdminRouter };
