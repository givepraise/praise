import { Router } from '@awaitjs/express';
import { addRole, all, removeRole, single, updateProfile } from './controllers';

// User routes
const userRouter = Router();
userRouter.getAsync('/all', all);
userRouter.getAsync('/:id', single);
userRouter.patchAsync('/updateProfile', updateProfile);

// User admin only routes
const adminUserRouter = Router();
adminUserRouter.patchAsync('/:id/addRole', addRole);
adminUserRouter.patchAsync('/:id/removeRole', removeRole);

export { userRouter, adminUserRouter };
