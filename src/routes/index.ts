import { Router } from 'express';
import userRouter from './users';


// Export the base-router
const baseRouter = Router();
baseRouter.use('/users', userRouter);
export default baseRouter;
