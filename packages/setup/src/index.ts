/* eslint-disable @typescript-eslint/restrict-template-expressions */
import inquirer from 'inquirer';
import * as dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { exit } from 'process';
import os from 'os';
import { isDocker } from './isDocker';
import path from 'path';
import * as bcrypt from 'bcrypt';

interface Answers {
  NODE_ENV: string;
  HOST: string;
  ADMINS: string;
  DISCORD_TOKEN: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_GUILD_ID: string;
}

/**
 * Load ENV, templates first, then override with actual ENV values
 * if there are any.
 */
const rootEnvPath = isDocker()
  ? '/usr/praise/.env'
  : path.resolve(__dirname, '../../../.env');
const rootEnvTemplatePath = isDocker()
  ? '/usr/praise/.env.template'
  : path.resolve(__dirname, '../../../.env.template');

// Top level
dotenv.config({ path: rootEnvTemplatePath, override: true });
dotenv.config({ path: rootEnvPath, override: true });

/**
 * Welcome message
 */
console.log('\n');
console.log(`██████╗░██████╗░░█████╗░██╗░██████╗███████╗
██╔══██╗██╔══██╗██╔══██╗██║██╔════╝██╔════╝
██████╔╝██████╔╝███████║██║╚█████╗░█████╗░░
██╔═══╝░██╔══██╗██╔══██║██║░╚═══██╗██╔══╝░░
██║░░░░░██║░░██║██║░░██║██║██████╔╝███████╗
╚═╝░░░░░╚═╝░░╚═╝╚═╝░░╚═╝╚═╝╚═════╝░╚══════╝`);
console.log('\n');
console.log(`*******************************************
** SETUP - configure Praise environment  **
** variables. See README for             **
** instructions regarding bot ids etc.   **
**                                       **
** Earlier settings will be overwritten. **
*******************************************`);
console.log('\n');

const questions = [
  {
    type: 'list',
    name: 'NODE_ENV',
    message: 'Will you be running Praise for development or production?',
    choices: ['production', 'development'],
    default: process.env.NODE_ENV,
  },
  {
    type: 'string',
    name: 'HOST',
    message: 'Server hostname',
    default: process.env.HOST,
  },
  {
    type: 'string',
    name: 'ADMINS',
    message: 'Admin Ethereum addresses, comma separated',
    default: process.env.ADMINS,
  },
  {
    type: 'string',
    name: 'DISCORD_TOKEN',
    message: 'Discord Token',
    default: process.env.DISCORD_TOKEN,
  },
  {
    type: 'string',
    name: 'DISCORD_CLIENT_ID',
    message: 'Discord Client ID',
    default: process.env.DISCORD_CLIENT_ID,
  },
  {
    type: 'string',
    name: 'DISCORD_GUILD_ID',
    message: 'Discord Guild ID',
    default: process.env.DISCORD_GUILD_ID,
  },
];

const setupAndWriteEnv = (
  templateFileName: string,
  outFileName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newValues: any
): void => {
  const envVars = readFileSync(templateFileName, 'utf8').split(os.EOL);

  for (const key in newValues) {
    const value = newValues[key] as string;
    const idx = envVars.findIndex((line) => line.startsWith(`${key}=`));
    envVars.splice(idx, 1, `${key}=${value}`);
  }

  writeFileSync(outFileName, envVars.join(os.EOL));
};

export const randomString = (length = 32): string => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const baseServerUrl = (answers: Answers): string =>
  answers.HOST === 'localhost'
    ? `http://${answers.HOST}`
    : `https://${answers.HOST}`;

const serverUrl = (answers: Answers): string => {
  if (answers.NODE_ENV === 'development') {
    return `http://${answers.HOST}:${process.env.API_PORT as string}`;
  }

  return baseServerUrl(answers);
};

const frontendUrl = (answers: Answers): string => {
  if (answers.NODE_ENV === 'development') {
    return `http://${answers.HOST}:${process.env.FRONTEND_PORT as string}`;
  }
  return baseServerUrl(answers);
};

const discordBotApiKey = randomString();

const apiKeys = discordBotApiKey;
const apiKeyRoles = 'API_KEY_DISCORD_BOT';

const run = async (): Promise<void> => {
  const answers = await inquirer.prompt(questions);

  const mongoInitDbRootPassword =
    process.env.MONGO_INITDB_ROOT_PASSWORD || randomString();
  const mongoPassword = process.env.MONGO_PASSWORD || randomString();

  const rootEnv = {
    NODE_ENV: answers.NODE_ENV,
    MONGO_HOST: answers.NODE_ENV === 'production' ? 'mongodb' : 'localhost',
    MONGO_INITDB_ROOT_USERNAME: process.env.MONGO_INITDB_ROOT_USERNAME,
    MONGO_INITDB_ROOT_PASSWORD: mongoInitDbRootPassword,
    MONGO_USERNAME: process.env.MONGO_USERNAME,
    MONGO_PASSWORD: mongoPassword,
    MONGO_DB: process.env.MONGO_DB,
    MONGO_URI: `mongodb://${process.env.MONGO_USERNAME}:${mongoPassword}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/{DB}?authSource=admin&ssl=false`,
    MONGO_ADMIN_URI: `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${mongoInitDbRootPassword}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/admin?authSource=admin&ssl=false`,
    HOST: answers.HOST,
    API_URL: serverUrl(answers),
    API_PORT: process.env.API_PORT,
    API_KEYS: process.env.API_KEYS || apiKeys,
    API_KEY_ROLES: process.env.API_KEY_ROLES || apiKeyRoles,
    API_KEY_SALT: `'${process.env.API_KEY_SALT || (await bcrypt.genSalt(10))}'`,
    ADMINS: answers.ADMINS,
    JWT_SECRET: process.env.JWT_SECRET || randomString(),
    JWT_ACCESS_EXP: process.env.JWT_ACCESS_EXP,
    JWT_REFRESH_EXP: process.env.JWT_REFRESH_EXP,
    FRONTEND_URL: frontendUrl(answers),
    REACT_APP_SERVER_URL: serverUrl(answers),
    FRONTEND_PORT: process.env.FRONTEND_PORT,
    LOGGER_LEVEL: process.env.LOGGER_LEVEL,
    DISCORD_TOKEN: answers.DISCORD_TOKEN,
    DISCORD_CLIENT_ID: answers.DISCORD_CLIENT_ID,
    DISCORD_GUILD_ID: answers.DISCORD_GUILD_ID,
  };

  setupAndWriteEnv(rootEnvTemplatePath, rootEnvPath, rootEnv);

  console.log('\n');
  console.log('🙏 ENV file has been created.');

  exit();
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
