import { Injectable } from '@nestjs/common';

export const HOSTNAME_TEST = 'test-community.givepraise.xyz';

export const MONGODB_MAIN_DB_TEST = 'praise-test';
export const MONGODB_MAIN_DB =
  process.env.NODE_ENV === 'testing'
    ? MONGODB_MAIN_DB_TEST
    : process.env.MONGO_DB;

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
