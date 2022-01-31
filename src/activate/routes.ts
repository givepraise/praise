import { Router } from 'express';
import { activate } from './controllers';

const activateRouter = Router();
activateRouter.post('/', activate);

export { activateRouter };
