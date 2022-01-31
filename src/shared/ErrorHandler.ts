import logger from '@shared/Logger';
import { Request, Response } from 'express';
import { errorCodes, errorNames } from './constants';
import { ErrorInterface } from './types';

interface ErrorResponse {
  message: string;
  name: string;
  code: number;
}

//TODO The three fuctions below all return different error formats. Shouldn't we find a common format?
const handleDuplicateKeyError = (err: any, res: Response): void => {
  const field = Object.keys(err.keyValue);
  const code = 409;
  const error = `An account with that ${field} already exists.`;
  res.status(code).send({ messages: error, fields: field });
};

const handleValidationError = (err: any, res: Response): void => {
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

const handleAppError = (err: ErrorInterface, res: Response): void => {
  const name = err.name;
  const code = errorCodes[name];

  const error: ErrorResponse = {
    message: err.message,
    name,
    code,
  };
  res.status(code).send(error);
};

export const ErrorHandler = (err: any, req: Request, res: Response): void => {
  logger.err(err);

  try {
    if (err.name === 'ValidationError') handleValidationError(err, res);
    if (err.code && err.code === 11000) handleDuplicateKeyError(err, res);
    if (
      err.name === errorNames.INTERNAL_SERVER_ERROR ||
      err.name === errorNames.NOT_FOUND ||
      err.name === errorNames.BAD_REQUEST ||
      err.name === errorNames.UNAUTHORIZED ||
      err.name === errorNames.FORBIDDEN
    ) {
      handleAppError(err, res);
    } else {
      res.status(500).send('An unknown error occurred.');
    }
  } catch (err) {
    res.status(500).send('An unknown error occurred.');
  }
};
