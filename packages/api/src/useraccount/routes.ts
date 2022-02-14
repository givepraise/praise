import { Router } from '@awaitjs/express';
import { all, single } from './controllers';

// User account-routes
const userAccountRouter = Router();
userAccountRouter.getAsync('/all', all);
userAccountRouter.getAsync('/:id', single);

export { userAccountRouter };
