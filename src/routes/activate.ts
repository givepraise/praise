import { activate } from '@controllers/activate';
import { Router } from 'express';

const activateRouter = Router();
activateRouter.post('/', activate);

export default activateRouter;
