import { cookieProps } from '@shared/constants';
import ErrorHandler from '@shared/ErrorHandler';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import mongoose, { ConnectOptions } from 'mongoose';
import morgan from 'morgan';
import path from 'path';
import seedData from './pre-start/seed';
import seedSettings from './pre-start/settings';
import seedAdmins from './pre-start/admins';
import BaseRouter from './routes';

dotenv.config({ path: path.join(__dirname, '..', '/.env') });

/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

const app = express();

mongoose
  .connect(
    process.env.MONGO_DB as string,
    {
      useNewUrlParser: true,
    } as ConnectOptions
  )
  .then(() => {
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
      seedData();
    }

    // Security
    if (process.env.NODE_ENV === 'production') {
      app.use(helmet());
    }

    seedSettings();
    seedAdmins();

    // Add APIs
    app.use('/api', BaseRouter);
    app.use(ErrorHandler);
  });

/************************************************************************************
 *                              Export Server
 ***********************************************************************************/

export default app;
