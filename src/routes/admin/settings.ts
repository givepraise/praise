import * as settingsController from '@controllers/settings';
import { Router } from 'express';

// Settings-routes
const adminSettingsRouter = Router();
adminSettingsRouter.patch('/:key/set', settingsController.set);

export default adminSettingsRouter;
