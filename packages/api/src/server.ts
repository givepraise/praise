import { ErrorHandler } from '@error/ErrorHandler';
import { cookieProps } from '@shared/constants';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { json, urlencoded } from 'express';
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

const app = express();

app.use(
  fileUpload({
    createParentPath: true,
  })
);

void (async (): Promise<void> => {
  const connection = await connectDatabase();

  // Checks database migrations and run them if they are not already applied
  logger.info('Checking for pending migrations…');
  const umzug = setupMigrator(connection);
  const migrations = await umzug.pending();
  logger.info(`Found ${migrations.length} pending migrations`);
  await umzug.up();
  logger.info('Migrations complete.');

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
  await seedAdmins();

  // Serve static files
  app.use('/uploads', express.static('uploads'));

  // API routes
  app.use('/api', baseRouter);

  // Error handling
  app.use(ErrorHandler);
})();

export { app };
