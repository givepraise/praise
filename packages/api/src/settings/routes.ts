import { Router } from '@awaitjs/express';
import { all, customExportTransformer, set, single } from './controllers';

// Settings-routes
const settingsRouter = Router();
settingsRouter.getAsync('/all', all);
settingsRouter.getAsync('/:id', single);

// User admin only routes
const settingsAdminRouter = Router();
settingsAdminRouter.getAsync(
  '/customExportTransformer',
  customExportTransformer
);
settingsAdminRouter.patchAsync('/:id/set', set);

export { settingsRouter, settingsAdminRouter };
