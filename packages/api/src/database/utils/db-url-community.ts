import { Community } from '../../community/schemas/community.schema';
import { dbNameCommunity } from './db-name-community';

export const dbUrlCommunity = (community: Community) => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }
  return process.env.MONGO_URI.replace('{DB}', dbNameCommunity(community));
};
