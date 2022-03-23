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
import { seedSettings } from './pre-start/settings';
import { baseRouter } from './routes';
import { connectDatabase } from './database';
import fileUpload from 'express-fileupload';

const app = express();

app.use(
  fileUpload({
    createParentPath: true,
  })
);

void (async (): Promise<void> => {
  await connectDatabase();

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

  // Serve static files
  app.use('/uploads', express.static('uploads'));

  // API routes
  app.use('/api', baseRouter);

  // Error handling
  app.use(ErrorHandler);
})();

export { app };
