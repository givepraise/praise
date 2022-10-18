import { Router } from '@awaitjs/express';
import { addRole, all, removeRole, single, updateProfile } from './controllers';

// User routes
const userRouter = Router();
userRouter.getAsync('/all', all);
userRouter.getAsync('/:id', single);

// User admin only routes
const adminUserRouter = Router();
adminUserRouter.patchAsync('/:id/addRole', addRole);
adminUserRouter.patchAsync('/:id/removeRole', removeRole);
adminUserRouter.patchAsync('/:id/updateProfile', updateProfile);

export { userRouter, adminUserRouter };
