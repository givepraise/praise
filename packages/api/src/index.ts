import 'express-async-errors';
import logger from 'jet-logger';
import { setup } from './server';

void (async (): Promise<void> => {
  const app = await setup();

  // Start the server
  const port = process.env.API_PORT;
  app.listen(port, () => {
    logger.info(`Express server started on port: ${port as string}`);
  });
})();
