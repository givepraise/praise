import { Router } from '@awaitjs/express';
import * as core from './controllers/core';
import * as assignment from './controllers/assignment';
import * as exportController from './controllers/export';

// Period-routes
const periodRouter = Router();

periodRouter.getAsync('/all', core.all);
periodRouter.getAsync('/:periodId', core.single);
periodRouter.getAsync('/:periodId/praise', core.praise);
periodRouter.getAsync('/:periodId/receiverPraise', core.receiverPraise);
periodRouter.getAsync('/:periodId/giverPraise', core.giverPraise);
periodRouter.getAsync('/:periodId/quantifierPraise', core.quantifierPraise);

// ADMIN Period-routes
const adminPeriodRouter = Router();
adminPeriodRouter.postAsync('/create', core.create);
adminPeriodRouter.patchAsync('/:periodId/update', core.update);
adminPeriodRouter.patchAsync('/:periodId/close', core.close);
adminPeriodRouter.getAsync('/:periodId/exportFull', exportController.full);
adminPeriodRouter.getAsync(
  '/:periodId/exportSummary',
  exportController.summary
);
adminPeriodRouter.getAsync('/:periodId/exportCustom', exportController.custom);
adminPeriodRouter.getAsync(
  '/:periodId/verifyQuantifierPoolSize',
  assignment.verifyQuantifierPoolSize
);
adminPeriodRouter.patchAsync(
  '/:periodId/assignQuantifiers',
  assignment.assignQuantifiers
);
adminPeriodRouter.patchAsync(
  '/:periodId/replaceQuantifier',
  assignment.replaceQuantifier
);

export { periodRouter, adminPeriodRouter };
