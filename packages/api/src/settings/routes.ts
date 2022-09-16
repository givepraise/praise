import { Router } from '@awaitjs/express';
import { all, getCustomExportTransformer, set, single } from './controllers';

// Settings-routes
const settingsRouter = Router();
settingsRouter.getAsync('/all', all);
settingsRouter.getAsync('/:id', single);

// User admin only routes
const settingsAdminRouter = Router();
settingsAdminRouter.getAsync('/customTransformer', getCustomExportTransformer);
settingsAdminRouter.patchAsync('/:id/set', set);

export { settingsRouter, settingsAdminRouter };
