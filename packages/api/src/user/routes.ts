import { Router } from '@awaitjs/express';
import { addRole, all, removeRole, single } from './controllers';

// User routes
const userRouter = Router();
userRouter.getAsync('/all', all);
userRouter.getAsync('/:id', single);

// User admin only routes
const adminUserRouter = Router();
adminUserRouter.getAsync('/all', all);
adminUserRouter.getAsync('/:id', single);
adminUserRouter.patchAsync('/:id/addRole', addRole);
adminUserRouter.patchAsync('/:id/removeRole', removeRole);

export { userRouter, adminUserRouter };
