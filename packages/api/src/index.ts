import * as dotenv from 'dotenv';
import 'express-async-errors';
import logger from 'jet-logger';
import path from 'path';
import { setup } from './server';

void (async (): Promise<void> => {
  const load = dotenv.config({ path: path.join(__dirname, '..', '/.env') });
  if (load.error) {
    logger.err(load.error.message);
    throw load.error;
  }

  const app = await setup();

  // Start the server
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    logger.info(`Express server started on port: ${port}`);
  });
})();
