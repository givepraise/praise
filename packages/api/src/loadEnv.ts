import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import logger from 'jet-logger';
import path from 'path';

let env = dotenv.config({
  path: path.join(__dirname, '..', '..', '..', '/.env'),
});
if (env.error) {
  logger.err(env.error.message);
  throw env.error;
}
dotenvExpand.expand(env);
env = dotenv.config({
  path: path.join(__dirname, '..', '/.env'),
});
if (env.error) {
  logger.err(env.error.message);
  throw env.error;
}
