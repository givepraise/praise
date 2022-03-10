import { Router } from '@awaitjs/express';
import { auth, nonce } from './controllers';

const authRouter = Router();
authRouter.getAsync('/nonce', nonce);
authRouter.postAsync('/', auth);

export { authRouter };
