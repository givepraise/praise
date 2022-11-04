import cors from 'cors';
import express, { json, urlencoded, Express } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import fileUpload from 'express-fileupload';
import { ErrorHandler } from '@/error/ErrorHandler';
import { seedData, seedAdminUsers } from '@/database/seeder/app';
import { connectDatabase } from './database/connection';
import { baseRouter } from './routes';
import { envCheck } from './pre-start/envCheck';
import { requiredEnvVariables } from './pre-start/env-required';
import { logger } from './shared/logger';
import { morganMiddleware } from './shared/morganMiddleware';

/**
 * Connect to database, run necessary migrations, and seed fake data,
 *  depending on NODE_ENV
 *
 * @param {string} [NODE_ENV='development']
 * @returns {Promise<void>}
 */
const setupDatabase = async (NODE_ENV = 'development'): Promise<void> => {
  // Check for required ENV variables
  envCheck(requiredEnvVariables);

  // Connect to database
  if (NODE_ENV === 'testing') {
    logger.info('Connecting to test database…');
    await connectDatabase({
      MONGO_DB: 'praise_db_testing_tmp',
    });
    logger.info('Connected to test database.');
  } else {
    logger.info('Connecting to database…');
    await connectDatabase();
    logger.info('Connected to database.');
  }

  // Seed database with fake data in 'development' environment
  if (NODE_ENV === 'development') {
    await seedData();
  }
};

/**
 * Prepare and initialize express server
 *
 * @param {string} [NODE_ENV='development']
 * @returns   {Promise<Express>}
 */
const setupApiServer = async (NODE_ENV = 'development'): Promise<Express> => {
  const app = express();

  //app.use((req, res, next) => setTimeout(next, 1000)); // Delay response during testing
  app.use(morganMiddleware);

  app.use(
    fileUpload({
      createParentPath: true,
    })
  );

  app.use(
    cors({
      origin: '*',
    })
  );
  app.use(json());
  app.use(urlencoded({ extended: true }));

  // Serve static files
  if (process.env.NODE_ENV === 'production') {
    app.use('/uploads', express.static('/usr/src/uploads'));
  } else {
    app.use('/uploads', express.static('uploads'));
  }

  // API routes
  app.use('/api', baseRouter);

  // Error handling
  app.use(ErrorHandler);

  if (NODE_ENV === 'development') {
    await seedAdminUsers();
  } else if (NODE_ENV === 'production') {
    await seedAdminUsers();
    app.use(helmet());
  } else if (NODE_ENV === 'testing') {
    await seedAdminUsers();
  }

  return app;
};

/**
 * Run application
 *
 * @returns {Promise<Express>}
 */
export const setup = async (): Promise<Express> => {
  await setupDatabase(process.env.NODE_ENV);
  const app = setupApiServer(process.env.NODE_ENV);

  return app;
};
