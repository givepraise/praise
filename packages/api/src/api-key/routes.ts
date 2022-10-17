import { Router } from '@awaitjs/express';
import { addApiKey, all, removeApiKey, single } from './controllers';

// User admin only routes
const adminUserRouter = Router();
adminUserRouter.getAsync('/all', all);
adminUserRouter.getAsync('/:id', single);
adminUserRouter.postAsync('/', addApiKey);
adminUserRouter.deleteAsync('/:id/', removeApiKey);

export { adminUserRouter };
