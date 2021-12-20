import { Router } from 'express';
import controller from '../controllers/auth';

const authRouter = Router();
authRouter.get('/nonce', controller.nonce);
authRouter.post('/', controller.auth);

export = authRouter;
