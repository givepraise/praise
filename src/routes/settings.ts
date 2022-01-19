import * as settingsController from '@controllers/settings';
import { Router } from 'express';

// Settings-routes
const settingsRouter = Router();
settingsRouter.get('/all', settingsController.all);
settingsRouter.get('/:key', settingsController.single);

export default settingsRouter;
