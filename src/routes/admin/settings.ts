import * as settingsController from '@controllers/settings';
import { UserRole } from '@entities/User';
import { authMiddleware } from '@middleware/auth';
import { Router } from 'express';

// Settings-routes
const settingsRouter = Router();
settingsRouter.get('/all', settingsController.all);
settingsRouter.get('/:key', settingsController.single);
settingsRouter.patch(
  '/:key/set',
  authMiddleware(UserRole.QUANTIFIER),
  settingsController.set
);

export = settingsRouter;
