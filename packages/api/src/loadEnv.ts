import * as dotenv from 'dotenv';
import logger from 'jet-logger';
import path from 'path';

let env = dotenv.config({
  path: path.join(__dirname, '..', '..', '..', '/.env'),
});
if (env.error) {
  logger.err(env.error.message);
  throw env.error;
}
env = dotenv.config({
  path: path.join(__dirname, '..', '/.env'),
});
if (env.error) {
  logger.err(env.error.message);
  throw env.error;
}
