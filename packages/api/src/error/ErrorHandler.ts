import { NextFunction, Request, Response } from 'express';
import logger from 'jet-logger';
import { Error } from 'mongoose';
import { errorCodes } from './constants';
import { AppError } from './types';
import { isAppError, isValidationError } from './utils';

const handleValidationError = (
  err: Error.ValidationError,
  res: Response
): void => {
  const code = 400;
  res.status(code).send(err);
};

const handleAppError = (err: AppError, res: Response): void => {
  const { name, message } = err;
  const code = errorCodes[name];
  res.status(code).send({ name, message });
};

export const ErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  logger.err(err);

  if (isValidationError(err)) {
    handleValidationError(err, res);
    return;
  }

  if (isAppError(err)) {
    handleAppError(err, res);
    return;
  }

  res.status(500).send('An unknown error occurred.');
};
