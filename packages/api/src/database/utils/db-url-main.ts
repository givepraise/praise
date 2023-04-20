import { MONGODB_MAIN_DB } from '../../constants/constants.provider';
import { logger } from '../../shared/logger';

export const dbUrlMain = () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }
  if (!MONGODB_MAIN_DB) {
    throw new Error('MONGODB_MAIN_DB is not defined');
  }
  const dbUrl = process.env.MONGO_URI.replace('{DB}', MONGODB_MAIN_DB);
  if (process.env.LOGGER_LEVEL === 'debug') {
    logger.debug(`dbUrlMain: ${dbUrl.replace(/\/.*@/, '//{user/pass}@')}`);
  }
  return process.env.MONGO_URI.replace('{DB}', MONGODB_MAIN_DB);
};
