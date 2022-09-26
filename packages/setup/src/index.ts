import inquirer from 'inquirer';
import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import { unlinkSync, existsSync } from 'fs';
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
const apiTemplateEnvPath = '/usr/praise/packages/discord-bot/.env.template';

const discordBotEnvPath = '/usr/praise/packages/api/.env';
const discordBotTemplateEnvPath =
  '/usr/praise/packages/dicord-bot/.env.template';

// Top level
dotenv.config({ path: rootEnvTemplatePath, override: true });
dotenv.config({ path: rootEnvPath, override: true });

// Discord Bot
if (existsSync(discordBotTemplateEnvPath)) {
  dotenv.config({ path: discordBotTemplateEnvPath, override: true });
  unlinkSync(discordBotTemplateEnvPath);
}
if (existsSync(discordBotEnvPath)) {
  dotenv.config({ path: discordBotEnvPath, override: true });
  unlinkSync(discordBotEnvPath);
}

// API
if (existsSync(apiTemplateEnvPath)) {
  dotenv.config({ path: apiTemplateEnvPath, override: true });
  unlinkSync(apiTemplateEnvPath);
}
if (existsSync(apiEnvPath)) {
  dotenv.config({ path: apiEnvPath, override: true });
  unlinkSync(apiEnvPath);
}

// Frontend
if (existsSync(frontendTemplateEnvPath)) {
  dotenv.config({ path: frontendTemplateEnvPath, override: true });
  unlinkSync(frontendEnvPath);
}
if (existsSync(frontendEnvPath)) {
  dotenv.config({ path: frontendEnvPath, override: true });
  unlinkSync(frontendEnvPath);
}

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

const getReactServerUrl = (answers: Answers): string => {
  if (process.env.REACT_APP_SERVER_URL) {
    return process.env.REACT_APP_SERVER_URL;
  }

  return answers.NODE_ENV === 'production'
    ? `https://${answers.HOST}`
    : `http://${answers.HOST}:${process.env.API_PORT as string}`;
};

const setupAndWriteEnv = async (
  templateFileName: string,
  outFileName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newValues: any
): Promise<void> => {
  const envVars = (await fs.readFile(templateFileName, 'utf8')).split(os.EOL);

  for (const key in newValues) {
    const value = newValues[key] as string;
    const idx = envVars.findIndex((line) => line.startsWith(`${key}=`));
    envVars.splice(idx, 1, `${key}=${value}`);
  }

  await fs.writeFile(outFileName, envVars.join(os.EOL));
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

const run = async (): Promise<void> => {
  const answers = await inquirer.prompt(questions);

  const rootEnv = {
    NODE_ENV: answers.NODE_ENV,
    HOST: answers.HOST,
    API_PORT: process.env.API_PORT,
    SERVER_URL:
      answers.NODE_ENV === 'production'
        ? `https://${answers.HOST as string}`
        : `http://${answers.HOST as string}:${process.env.API_PORT as string}`,
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
    REACT_APP_SERVER_URL: getReactServerUrl(answers),
    PORT: process.env.PORT,
    JET_LOGGER_MODE: process.env.JET_LOGGER_MODE,
    JET_LOGGER_FILEPATH: process.env.JET_LOGGER_FILEPATH,
    JET_LOGGER_TIMESTAMP: process.env.JET_LOGGER_TIMESTAMP,
    JET_LOGGER_FORMAT: process.env.JET_LOGGER_FORMAT,
    JWT_SECRET: process.env.JWT_SECRET || randomString(),
    JWT_ACCESS_EXP: process.env.JWT_ACCESS_EXP,
    JWT_REFRESH_EXP: process.env.JWT_REFRESH_EXP,
  };

  await setupAndWriteEnv(rootEnvTemplatePath, rootEnvPath, rootEnv);

  console.log('\n');
  console.log('🙏 ENV file has been created.');

  exit();
};

run();
