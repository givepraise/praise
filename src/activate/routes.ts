import * as controller from '@activate/controllers';
import { Router } from 'express';

const activateRouter = Router();
activateRouter.post('/', controller.activate);

export { activateRouter };
