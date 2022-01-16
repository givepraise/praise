import controller from '@controllers/praise';
import { Router } from 'express';

const praiseRouter = Router();

praiseRouter.get('/import', controller.importData);

export default praiseRouter;
