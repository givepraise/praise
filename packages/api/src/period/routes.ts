import { Router } from '@awaitjs/express';
import * as periodCoreController from '@/period/controllers/core';
import * as periodAssignmentController from '@/period/controllers/assignment';

// Period-routes
const periodRouter = Router();

periodRouter.getAsync('/all', periodCoreController.all);
periodRouter.getAsync('/:periodId', periodCoreController.single);
periodRouter.getAsync(
  '/:periodId/receiverPraise',
  periodCoreController.receiverPraise
);
periodRouter.getAsync(
  '/:periodId/quantifierPraise',
  periodCoreController.quantifierPraise
);

// ADMIN Period-routes
const adminPeriodRouter = Router();
adminPeriodRouter.postAsync('/create', periodCoreController.create);
adminPeriodRouter.patchAsync('/:periodId/update', periodCoreController.update);
adminPeriodRouter.patchAsync('/:periodId/close', periodCoreController.close);
adminPeriodRouter.getAsync(
  '/:periodId/export',
  periodCoreController.exportPraise
);
adminPeriodRouter.getAsync(
  '/:periodId/verifyQuantifierPoolSize',
  periodAssignmentController.verifyQuantifierPoolSize
);
adminPeriodRouter.patchAsync(
  '/:periodId/assignQuantifiers',
  periodAssignmentController.assignQuantifiers
);

export { periodRouter, adminPeriodRouter };
