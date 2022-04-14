import { ErrorHandler } from '@error/ErrorHandler';
import { cookieProps } from '@shared/constants';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { json, urlencoded, Express } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import logger from 'jet-logger';
import morgan from 'morgan';
import { seedAdmins } from './pre-start/admins';
import { seedData } from './pre-start/seed';
import { baseRouter } from './routes';
import { connectDatabase } from './database/connection';
import { setupMigrator } from './database/migration';
import fileUpload from 'express-fileupload';

const setupDatabase = async (NODE_ENV = 'development'): Promise<void> => {
  let db;

  if (NODE_ENV === 'testing') {
    logger.info('Connecting to test database…');
    db = await connectDatabase({
      MONGO_DB: 'praise_db_testing_tmp',
    });
    logger.info('Connected to test database.');
  } else {
    logger.info('Connecting to database…');
    db = await connectDatabase();
    logger.info('Connected to database.');
  }

  // Checks database migrations and run them if they are not already applied
  logger.info('Checking for pending migrations…');
  const umzug = setupMigrator(db.connection);
  const migrations = await umzug.pending();
  logger.info(`Found ${migrations.length} pending migrations`);
  await umzug.up();
  logger.info('Migrations complete.');

  // Seed database with fake data in 'development' environment
  if (NODE_ENV === 'development') {
    await seedData();
  }
};

const setupApiServer = async (NODE_ENV = 'development'): Promise<Express> => {
  const app = express();

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
  app.use(cookieParser(cookieProps.secret));

  // Serve static files
  app.use('/uploads', express.static('uploads'));

  // API routes
  app.use('/api', baseRouter);

  // Error handling
  app.use(ErrorHandler);

  if (NODE_ENV === 'development') {
    await seedAdmins();
    app.use(morgan('dev'));
  } else if (NODE_ENV === 'production') {
    await seedAdmins();
    app.use(helmet());
  } else if (NODE_ENV === 'testing') {
    await seedAdmins();
    app.use(morgan('dev'));
  }

  return app;
};

const setup = async (): Promise<Express> => {
  await setupDatabase(process.env.NODE_ENV);
  const app = setupApiServer(process.env.NODE_ENV);

  return app;
};

export { setup };
