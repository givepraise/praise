import inquirer from 'inquirer';
import * as dotenv from 'dotenv';
import { unlinkSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { exit } from 'process';
import os from 'os';

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
const rootEnvPath = '/usr/praise/.env';
const rootEnvTemplatePath = '/usr/praise/.env.template';

const frontendEnvPath = '/usr/praise/packages/frontend/.env';
const frontendTemplateEnvPath = '/usr/praise/packages/frontend/.env.template';

const apiEnvPath = '/usr/praise/packages/api/.env';
const apiTemplateEnvPath = '/usr/praise/packages/api/.env.template';

const discordBotEnvPath = '/usr/praise/packages/discord-bot/.env';
const discordBotTemplateEnvPath =
  '/usr/praise/packages/discord-bot/.env.template';

// Top level
dotenv.config({ path: rootEnvTemplatePath, override: true });
dotenv.config({ path: rootEnvPath, override: true });

// Discord Bot
dotenv.config({ path: discordBotTemplateEnvPath, override: true });
dotenv.config({ path: discordBotEnvPath, override: true });

// API
dotenv.config({ path: apiTemplateEnvPath, override: true });
dotenv.config({ path: apiEnvPath, override: true });

// Frontend
dotenv.config({ path: frontendTemplateEnvPath, override: true });
dotenv.config({ path: frontendEnvPath, override: true });

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

const getServerUrl = (answers: Answers): string => {
  if (answers.NODE_ENV === 'development') {
    return `http://${answers.HOST}:${process.env.API_PORT as string}`;
  }

  return answers.HOST === 'localhost'
    ? `http://${answers.HOST as string}`
    : `https://${answers.HOST}`;
};

const deleteOldEnvFiles = (): void => {
  // Discord Bot
  if (existsSync(discordBotTemplateEnvPath)) {
    unlinkSync(discordBotTemplateEnvPath);
  }
  if (existsSync(discordBotEnvPath)) {
    unlinkSync(discordBotEnvPath);
  }

  // API
  if (existsSync(apiTemplateEnvPath)) {
    unlinkSync(apiTemplateEnvPath);
  }
  if (existsSync(apiEnvPath)) {
    unlinkSync(apiEnvPath);
  }

  // Frontend
  if (existsSync(frontendTemplateEnvPath)) {
    unlinkSync(frontendEnvPath);
  }
  if (existsSync(frontendEnvPath)) {
    unlinkSync(frontendEnvPath);
  }
};

const run = async (): Promise<void> => {
  const answers = await inquirer.prompt(questions);

  const rootEnv = {
    NODE_ENV: answers.NODE_ENV,
    HOST: answers.HOST,
    API_PORT: process.env.API_PORT,
    SERVER_URL: process.env.SERVER_URL || getServerUrl(answers),
    FRONTEND_URL:
      answers.NODE_ENV === 'production'
        ? `https://${answers.HOST as string}`
        : `http://${answers.HOST as string}:${process.env.PORT as string}`,
    MONGO_HOST: answers.NODE_ENV === 'production' ? 'mongodb' : 'localhost',
    MONGO_INITDB_ROOT_USERNAME: process.env.MONGO_INITDB_ROOT_USERNAME,
    MONGO_INITDB_ROOT_PASSWORD:
      process.env.MONGO_INITDB_ROOT_PASSWORD || randomString(),
    MONGO_USERNAME: process.env.MONGO_USERNAME,
    MONGO_PASSWORD: process.env.MONGO_PASSWORD || randomString(),
    ADMINS: answers.ADMINS,
    DISCORD_TOKEN: answers.DISCORD_TOKEN,
    DISCORD_CLIENT_ID: answers.DISCORD_CLIENT_ID,
    DISCORD_GUILD_ID: answers.DISCORD_GUILD_ID,
    REACT_APP_SERVER_URL:
      process.env.REACT_APP_SERVER_URL || getServerUrl(answers),
    PORT: process.env.PORT,
    JET_LOGGER_MODE: process.env.JET_LOGGER_MODE,
    JET_LOGGER_FILEPATH: process.env.JET_LOGGER_FILEPATH,
    JET_LOGGER_TIMESTAMP: process.env.JET_LOGGER_TIMESTAMP,
    JET_LOGGER_FORMAT: process.env.JET_LOGGER_FORMAT,
    JWT_SECRET: process.env.JWT_SECRET || randomString(),
    JWT_ACCESS_EXP: process.env.JWT_ACCESS_EXP,
    JWT_REFRESH_EXP: process.env.JWT_REFRESH_EXP,
  };

  setupAndWriteEnv(rootEnvTemplatePath, rootEnvPath, rootEnv);
  deleteOldEnvFiles();

  console.log('\n');
  console.log('🙏 ENV file has been created.');

  exit();
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
