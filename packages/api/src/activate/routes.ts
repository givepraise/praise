import { Router } from '@awaitjs/express';
import { activate } from './controllers';

const activateRouter = Router();
activateRouter.postAsync('/', activate);

export { activateRouter };
