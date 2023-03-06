import { Injectable } from '@nestjs/common';

export const uploadDirectory =
  process.env.NODE_ENV === 'production' ? '/usr/src/uploads/' : 'uploads/';

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
