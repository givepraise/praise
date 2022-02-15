import { cookieProps } from '@shared/constants';
import { ErrorHandler } from '@shared/ErrorHandler';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { json, urlencoded } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import logger from 'jet-logger';
import mongoose, { ConnectOptions } from 'mongoose';
import morgan from 'morgan';
import { seedAdmins } from './pre-start/admins';
import { seedSettings } from './pre-start/settings';
import { baseRouter } from './routes';

//const app = addAsync(express());
const app = express();

void (async (): Promise<void> => {
  logger.info('Connecting to database…');
  try {
    await mongoose.connect(
      process.env.MONGO_DB as string,
      {
        useNewUrlParser: true,
      } as ConnectOptions
    );
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
      //await seedData();

      logger.info('Seeded database with test data.');
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
