import { WinstonModule } from 'nest-winston';
import { transports } from './logger';

export const AppConfig = {
  cors: true,
  logger: WinstonModule.createLogger({
    transports,
  }),
};
