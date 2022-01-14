import controller from '@controllers/users';
import { Router } from 'express';

// User-routes
const userRouter = Router();
userRouter.get('/all', controller.all);
userRouter.get('/:id', controller.single);

export default userRouter;
