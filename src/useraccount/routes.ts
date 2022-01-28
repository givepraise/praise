import { Router } from 'express';
import { all, single } from './controllers';

// User-routes
const userRouter = Router();
userRouter.get('/all', all);
userRouter.get('/:id', single);

export { userRouter };
