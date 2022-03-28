import { Router } from '@awaitjs/express';
import * as periodAdminController from '@period/controllers/admin';
import * as periodController from '@period/controllers/core';
import * as periodSettingsController from '@period/controllers/settings';

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

// Period Settings-routes
periodRouter.getAsync('/:periodId/settings/all', periodSettingsController.all);
periodRouter.getAsync(
  '/:periodId/settings/:settingId',
  periodSettingsController.single
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

// ADMIN Period Settings-routes
adminPeriodRouter.patchAsync(
  '/:periodId/settings/:id/set',
  periodSettingsController.set
);

export { periodRouter, adminPeriodRouter };
