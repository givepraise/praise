import * as controller from '@praise/controllers';
import { UserRole } from '@user/types';
import { authMiddleware } from '@auth/middleware';
import { Router } from 'express';

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

export { praiseRouter };
