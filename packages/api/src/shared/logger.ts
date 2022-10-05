import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = (): string => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const dailyRotateTransport: DailyRotateFile = new DailyRotateFile({
  level: 'error',
  filename: 'log-%DATE%.log',
  dirname: 'logs',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxSize: '10m',
  maxFiles: '7d',
});

const transports = [new winston.transports.Console(), dailyRotateTransport];

export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});
