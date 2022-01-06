import { Router } from 'express';
import controller from '@controllers/useraccounts';

// User-routes
const userRouter = Router();
userRouter.get('/all', controller.all);
userRouter.get('/:id', controller.single);

export = userRouter;
