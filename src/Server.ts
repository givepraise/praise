import { cookieProps } from '@shared/constants';
import logger from '@shared/Logger';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import StatusCodes from 'http-status-codes';
import mongoose, { ConnectOptions } from 'mongoose';
import morgan from 'morgan';
import BaseRouter from './routes';
import seedData from './seed';
import ErrorHandler from '@shared/ErrorHandler';

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

    app.use(
      cors({
        origin: '*',
      })
    );
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
    app.use(ErrorHandler);

    seedData();

    app.listen(5000, () => {
      console.log('Server has started!');
    });
  });

/************************************************************************************
 *                              Export Server
 ***********************************************************************************/

export default app;
