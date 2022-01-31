import { Router } from 'express';
import * as settingsController from './controllers';

// Settings-routes
const settingsRouter = Router();
settingsRouter.get('/all', settingsController.all);
settingsRouter.get('/:key', settingsController.single);

// User admin only routes
const settingsAdminRouter = Router();
settingsAdminRouter.patch('/:key/set', settingsController.set);

export { settingsRouter, settingsAdminRouter };
