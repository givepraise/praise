import inquirer from 'inquirer';
import * as fs from 'fs/promises';
import * as dotenv from 'dotenv';
import { exit } from 'process';
import os from 'os';

/**
 * Load ENV, templates first, then override with actual ENV values
 * if there are any.
 */

// Top level
dotenv.config({ path: '/usr/praise/.env.template', override: true });
dotenv.config({ path: '/usr/praise/.env', override: true });

// API
dotenv.config({
  path: '/usr/praise/packages/api/.env.template',
  override: true,
});
dotenv.config({ path: '/usr/praise/packages/api/.env', override: true });

// Discord Bot
dotenv.config({
  path: '/usr/praise/packages/discord-bot/.env.template',
  override: true,
});
dotenv.config({
  path: '/usr/praise/packages/discord-bot/.env',
  override: true,
});

// Frontend
dotenv.config({
  path: '/usr/praise/packages/frontend/.env.template',
  override: true,
});
dotenv.config({ path: '/usr/praise/packages/frontend/.env', override: true });

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
    type: 'password',
    name: 'MONGO_INITDB_ROOT_PASSWORD',
    message: 'MongoDB Root Password',
    default: process.env.MONGO_INITDB_ROOT_PASSWORD,
  },
  {
    type: 'password',
    name: 'MONGO_PASSWORD',
    message: 'MongoDB User Password',
    default: process.env.MONGO_PASSWORD,
  },
  {
    type: 'string',
    name: 'HOST',
    message: 'Server hostname',
    default: process.env.HOST,
  },
  {
    type: 'string',
    name: 'API_PORT',
    message: 'API port number',
    default: process.env.API_PORT,
  },
  {
    type: 'string',
    name: 'PORT',
    message: 'Frontend port number (Only used for development)',
    default: process.env.PORT,
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

const run = async (): Promise<void> => {
  const answers = await inquirer.prompt(questions);

  const rootEnv = {
    NODE_ENV: answers.NODE_ENV,
    HOST: answers.HOST,
    API_PORT: answers.API_PORT,
    SERVER_URL:
      answers.NODE_ENV === 'production'
        ? `https://${answers.HOST as string}`
        : `http://${answers.HOST as string}`,
    FRONTEND_URL:
      answers.NODE_ENV === 'production'
        ? `https://${answers.HOST as string}`
        : `http://${answers.HOST as string}:${answers.PORT as string}`,
    MONGO_HOST: answers.NODE_ENV === 'production' ? 'mongodb' : 'localhost',
    MONGO_INITDB_ROOT_PASSWORD: answers.MONGO_INITDB_ROOT_PASSWORD,
    MONGO_PASSWORD: answers.MONGO_PASSWORD,
  };
  await setupAndWriteEnv(
    '/usr/praise/.env.template',
    '/usr/praise/.env',
    rootEnv
  );

  const apiEnv = {
    ADMINS: answers.ADMINS,
    COOKIE_DOMAIN: answers.HOST,
  };
  await setupAndWriteEnv(
    '/usr/praise/packages/api/.env.template',
    '/usr/praise/packages/api/.env',
    apiEnv
  );

  const discordBotEnv = {
    DISCORD_TOKEN: answers.DISCORD_TOKEN,
    DISCORD_CLIENT_ID: answers.DISCORD_CLIENT_ID,
    DISCORD_GUILD_ID: answers.DISCORD_GUILD_ID,
  };
  await setupAndWriteEnv(
    '/usr/praise/packages/discord-bot/.env.template',
    '/usr/praise/packages/discord-bot/.env',
    discordBotEnv
  );

  const frontendEnv = {
    REACT_APP_SERVER_URL:
      answers.NODE_ENV === 'production'
        ? `https://${answers.HOST as string}`
        : `http://${answers.HOST as string}:${answers.API_PORT as string}`,
    PORT: answers.PORT,
  };
  await setupAndWriteEnv(
    '/usr/praise/packages/frontend/.env.template',
    '/usr/praise/packages/frontend/.env',
    frontendEnv
  );

  console.log('\n');
  console.log('🙏 ENV files have been created.');

  exit();
};

run();
