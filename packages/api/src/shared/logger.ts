import winston, { LogEntry } from 'winston';
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
  const isProduction = env === 'production';
  const loggerLevel = process.env.LOGGER_LEVEL || 'warn';
  return isProduction ? loggerLevel : 'debug';
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
  winston.format.printf(
    (info: LogEntry) =>
      `${info.timestamp as string} ${info.level}: ${info.message}`,
  ),
);

const consoleOptions = {
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    format,
  ),
};

const dailyRotateTransport: DailyRotateFile = new DailyRotateFile({
  filename: 'log-%DATE%.log',
  dirname: 'logs',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxSize: '10m',
  maxFiles: '7d',
  level: level(),
  format,
});

export const transports = [
  new winston.transports.Console(consoleOptions),
  dailyRotateTransport,
];

export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});
