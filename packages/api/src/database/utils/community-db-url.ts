import { Community } from '../../community/schemas/community.schema';
import { dbNameCommunity } from './community-db-name';

export const dbUrlCommunity = (community: Community) =>
  `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${
    process.env.MONGO_HOST
  }:${process.env.MONGO_PORT}/${dbNameCommunity(
    community,
  )}?authSource=admin&appname=PraiseApi`;
