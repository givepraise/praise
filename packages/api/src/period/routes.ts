import { Router } from '@awaitjs/express';
import * as core from './controllers/core';
import * as assignment from './controllers/assignment';

// Period-routes
const periodRouter = Router();

periodRouter.getAsync('/all', core.all);
periodRouter.getAsync('/:periodId', core.single);
periodRouter.getAsync('/:periodId/praise', core.praise);
periodRouter.getAsync('/:periodId/receiverPraise', core.receiverPraise);
periodRouter.getAsync('/:periodId/quantifierPraise', core.quantifierPraise);

// ADMIN Period-routes
const adminPeriodRouter = Router();
adminPeriodRouter.postAsync('/create', core.create);
adminPeriodRouter.patchAsync('/:periodId/update', core.update);
adminPeriodRouter.patchAsync('/:periodId/close', core.close);
adminPeriodRouter.getAsync('/:periodId/export', core.exportPraise);
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
