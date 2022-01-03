import { NextFunction, Request, Response } from 'express';

const ErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (err.name === 'ValidationError')
      return (err = handleValidationError(err, res));
    if (err.code && err.code == 11000)
      return (err = handleDuplicateKeyError(err, res));
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
  let errors = {};

  Object.keys(err.errors).forEach((key) => {
    const obj = err.errors[key];
    const error: any = {};
    error[key] = obj.message;
    Object.assign(errors, error);
  });

  let code = 400;
  res.status(code).send(errors);
};

export default ErrorHandler;
