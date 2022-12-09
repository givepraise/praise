import { ConsoleLogger } from '@nestjs/common';

export class Logger extends ConsoleLogger {
  info(message: any, stack?: string, context?: string) {
    // add your tailored logic here
    super.error(message, stack, context);
  }
}
