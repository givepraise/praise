import { Router } from '@awaitjs/express';
import { all, set, single } from './controllers';

// Settings-routes
const settingsRouter = Router();
settingsRouter.getAsync('/all', all);
settingsRouter.getAsync('/:key', single);

// User admin only routes
const settingsAdminRouter = Router();
settingsAdminRouter.patchAsync('/:key/set', set);

export { settingsRouter, settingsAdminRouter };
