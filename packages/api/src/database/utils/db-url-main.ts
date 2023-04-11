import { MONGODB_MAIN_DB } from '../../constants/constants.provider';

export const dbUrlMain = () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }
  if (!MONGODB_MAIN_DB) {
    throw new Error('MONGODB_MAIN_DB is not defined');
  }
  return process.env.MONGO_URI.replace('{DB}', MONGODB_MAIN_DB);
};
