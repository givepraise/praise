import './env';
import 'express-async-errors';
import logger from 'jet-logger';
import { app } from './server';

// Start the server
const port = 8088;
app.listen(port, () => {
  logger.info(`Express server started on port: ${port}`);
});
