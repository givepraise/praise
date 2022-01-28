import { Router } from 'express';
import { auth, nonce } from './controllers';

const authRouter = Router();
authRouter.get('/nonce', nonce);
authRouter.post('/', auth);

export { authRouter };
