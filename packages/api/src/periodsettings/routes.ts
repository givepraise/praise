import { Router } from '@awaitjs/express';
import { all, set, single } from './controllers';

// Period Settings-routes
const periodsettingsRouter = Router();
periodsettingsRouter.getAsync('/:periodId/settings/all', all);
periodsettingsRouter.getAsync('/:periodId/settings/:settingId', single);

// ADMIN Period Settings-routes
const adminPeriodsettingsRouter = Router();
adminPeriodsettingsRouter.patchAsync('/:periodId/settings/:settingId/set', set);

export { periodsettingsRouter, adminPeriodsettingsRouter };
