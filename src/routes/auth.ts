import controller from '@controllers/auth';
import { Router } from 'express';

const authRouter = Router();
authRouter.get('/nonce', controller.nonce);
authRouter.post('/', controller.auth);

export default authRouter;
