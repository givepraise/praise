import { Router } from 'express';
import controller from '@controllers/users';

// User-routes
const userRouter = Router();
userRouter.get('/', controller.getAdminUsers);
userRouter.get('/:id', controller.getAdminUser);

export = userRouter;
