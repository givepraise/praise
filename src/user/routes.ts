import { Router } from 'express';
import controller from 'src/user/controllers';

// User-routes
const userRouter = Router();
userRouter.get('/all', controller.all);
userRouter.get('/:id', controller.single);

export default userRouter;
