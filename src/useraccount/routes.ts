import { Router } from 'express';
import { all, single } from './controllers';

// User account-routes
const userAccountRouter = Router();
userAccountRouter.get('/all', all);
userAccountRouter.get('/:id', single);

export { userAccountRouter };
