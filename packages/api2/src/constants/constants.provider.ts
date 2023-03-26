import { Injectable } from '@nestjs/common';

export const TEST_PRAISE_DB_NAME = '_test-praise';
export const TEST_COMMUNITY_DB_NAME = '_test-community';

export const MAIN_DB_NAME =
  process.env.NODE_ENV === 'testing'
    ? TEST_PRAISE_DB_NAME
    : process.env.MONGO_DB;

export const uploadDirectory =
  process.env.NODE_ENV === 'production' ? '/usr/src/uploads/' : 'uploads/';

export const adminDbUrl = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}?authSource=admin&appname=PraiseApiMigrations`;

export const apiKeys = process.env.API_KEYS
  ? process.env.API_KEYS.split(',')
  : [];
export const apiKeyRoles = process.env.API_KEY_ROLES
  ? process.env.API_KEY_ROLES.split(',')
  : [];

export const apiKeySalt = process.env.API_KEY_SALT || 'salt';

@Injectable()
export class ConstantsProvider {
  public uploadDirectory = uploadDirectory;
  public apiKeys = apiKeys;
  public apiKeyRoles = apiKeyRoles;
  public apiKeySalt = apiKeySalt;
}
