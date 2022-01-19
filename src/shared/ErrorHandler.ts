import { NextFunction, Request, Response } from 'express';
import { errorNames, errorCodes } from './constants';
import { ErrorInterface } from './types';
import logger from '@shared/Logger';

const ErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.err(err);

  try {
    if (err.name === 'ValidationError')
      return (err = handleValidationError(err, res));
    if (err.code && err.code == 11000)
      return (err = handleDuplicateKeyError(err, res));
    if (
      err.name === errorNames.INTERNAL_SERVER_ERROR ||
      err.name === errorNames.NOT_FOUND ||
      err.name === errorNames.BAD_REQUEST ||
      err.name === errorNames.UNAUTHORIZED ||
      err.name === errorNames.FORBIDDEN
    ) {
      return (err = handleAppError(err, res));
    } else {
      res.status(500).send('An unknown error occurred.');
    }
  } catch (err) {
    res.status(500).send('An unknown error occurred.');
  }
};

const handleDuplicateKeyError = (err: any, res: Response) => {
  const field = Object.keys(err.keyValue);
  const code = 409;
  const error = `An account with that ${field} already exists.`;
  res.status(code).send({ messages: error, fields: field });
};

const handleValidationError = (err: any, res: Response) => {
  const errors = {};

  Object.keys(err.errors).forEach((key) => {
    const obj = err.errors[key];
    const error: any = {};
    error[key] = obj.message;
    Object.assign(errors, error);
  });

  const code = 400;
  res.status(code).send(errors);
};

const handleAppError = (err: ErrorInterface, res: Response) => {
  const name = err.name;
  const code = errorCodes[name];

  const error = {
    message: err.message,
    name,
    code,
  };
  res.status(code).send(error);
};

export default ErrorHandler;
