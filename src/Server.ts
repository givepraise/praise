import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import StatusCodes from 'http-status-codes';
import express, { NextFunction, Request, Response } from 'express';
import mongoose, { ConnectOptions } from 'mongoose';

import 'express-async-errors';

import BaseRouter from './routes';
import logger from '@shared/Logger';
import { cookieProps } from '@shared/constants';
import seedData from './seed';

/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

const app = express();

mongoose
  .connect('mongodb://localhost:27017/praise_db', {
    useNewUrlParser: true,
  } as ConnectOptions)
  .then(() => {
    const { BAD_REQUEST } = StatusCodes;

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser(cookieProps.secret));

    // Show routes called in console during development
    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    }

    // Security
    if (process.env.NODE_ENV === 'production') {
      app.use(helmet());
    }

    // Add APIs
    app.use('/api', BaseRouter);

    seedData();

    // Print API errors
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      logger.err(err, true);
      return res.status(BAD_REQUEST).json({
        error: err.message,
      });
    });

    app.listen(5000, () => {
      console.log('Server has started!');
    });
  });

/************************************************************************************
 *                              Export Server
 ***********************************************************************************/

export default app;
