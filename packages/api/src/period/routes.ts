import { Router } from '@awaitjs/express';
import * as periodAdminController from '@period/controllers/admin';
import * as periodController from '@period/controllers/core';

// Period-routes
const periodRouter = Router();

periodRouter.getAsync('/all', periodController.all);
periodRouter.getAsync('/:periodId', periodController.single);
periodRouter.getAsync(
  '/:periodId/receiverPraise',
  periodController.receiverPraise
);
periodRouter.getAsync(
  '/:periodId/quantifierPraise',
  periodController.quantifierPraise
);

// ADMIN Period-routes
const adminPeriodRouter = Router();
adminPeriodRouter.postAsync('/create', periodAdminController.create);
adminPeriodRouter.patchAsync('/:periodId/update', periodAdminController.update);
adminPeriodRouter.patchAsync('/:periodId/close', periodAdminController.close);
adminPeriodRouter.getAsync(
  '/:periodId/verifyQuantifierPoolSize',
  periodAdminController.verifyQuantifierPoolSize
);
adminPeriodRouter.patchAsync(
  '/:periodId/assignQuantifiers',
  periodAdminController.assignQuantifiers
);
adminPeriodRouter.getAsync(
  '/:periodId/export',
  periodAdminController.exportPraise
);

export { periodRouter, adminPeriodRouter };
