import { Router } from '@awaitjs/express';
import { auth, nonce, refresh } from './controllers';

const authRouter = Router();
authRouter.getAsync('/nonce', nonce);
authRouter.postAsync('/', auth);
authRouter.postAsync('/refresh', refresh);

export { authRouter };
