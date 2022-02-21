import { ErrorHandler } from '@error/ErrorHandler';
import { cookieProps } from '@shared/constants';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { json, urlencoded } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import logger from 'jet-logger';
import mongoose, { ConnectOptions } from 'mongoose';
import morgan from 'morgan';
import { seedAdmins } from './pre-start/admins';
import { seedData } from './pre-start/seed';
import { seedSettings } from './pre-start/settings';
import { baseRouter } from './routes';

const app = express();

const username = process.env.MONGO_USERNAME || '';
const password = process.env.MONGO_PASSWORD || '';
const host = process.env.MONGO_HOST || '';
const port = process.env.MONGO_PORT || '';
const dbName = process.env.MONGO_DB || '';

const db = `mongodb://${username}:${password}@${host}:${port}/${dbName}`;
void (async (): Promise<void> => {
  logger.info('Connecting to database…');
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
    } as ConnectOptions);
    logger.info('Connected to database.');
  } catch (error) {
    logger.err('Could not connect to database.');
  }

  app.use(
    cors({
      origin: '*',
    })
  );
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(cookieParser(cookieProps.secret));
  // Show routes called in console during development
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    try {
      await seedData();
    } catch (error) {
      logger.err('Could not connect to database.');
    }
  }
  // Security
  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
  }
  await seedSettings();
  await seedAdmins();
  // API routes
  app.use('/api', baseRouter);

  // Error handling
  app.use(ErrorHandler);
})();

export { app };
