import * as settingsController from '@settings/controllers';
import { Router } from 'express';

// Settings-routes
const settingsRouter = Router();
settingsRouter.get('/all', settingsController.all);
settingsRouter.get('/:key', settingsController.single);

// ADMIN Settings-routes
const adminSettingsRouter = Router();
adminSettingsRouter.patch('/:key/set', settingsController.set);

export { settingsRouter, adminSettingsRouter };
