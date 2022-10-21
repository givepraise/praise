import { Router } from '@awaitjs/express';
import { addApiKey, all, removeApiKey, single } from './controllers';

// User admin only routes
const adminApikeyRouter = Router();
adminApikeyRouter.getAsync('/all', all);
adminApikeyRouter.getAsync('/:id', single);
adminApikeyRouter.postAsync('/', addApiKey);
adminApikeyRouter.deleteAsync('/:id/', removeApiKey);

export { adminApikeyRouter };
