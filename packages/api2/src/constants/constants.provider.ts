import { Injectable } from '@nestjs/common';

export const HOSTNAME_TEST = 'test-community.givepraise.xyz';

export const DB_NAME_MAIN_TEST = 'praise-test';
export const DB_NAME_MAIN =
  process.env.NODE_ENV === 'testing' ? DB_NAME_MAIN_TEST : process.env.MONGO_DB;

export const DB_URL_ROOT = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_HOST}?authSource=admin&appname=PraiseApi`;
export const DB_URL_MAIN_DB = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${DB_NAME_MAIN}?authSource=admin&appname=PraiseApi`;

export const API_KEYS = process.env.API_KEYS
  ? process.env.API_KEYS.split(',')
  : [];
export const API_KEY_ROLES = process.env.API_KEY_ROLES
  ? process.env.API_KEY_ROLES.split(',')
  : [];

export const API_KEY_SALT = process.env.API_KEY_SALT || 'salt';

export const UPLOAD_DIRECTORY =
  process.env.NODE_ENV === 'production' ? '/usr/src/uploads/' : 'uploads/';

@Injectable()
export class ConstantsProvider {
  public uploadDirectory = UPLOAD_DIRECTORY;
  public apiKeys = API_KEYS;
  public apiKeyRoles = API_KEY_ROLES;
  public apiKeySalt = API_KEY_SALT;
}
