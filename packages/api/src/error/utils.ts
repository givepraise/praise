import mongoose from 'mongoose';
import { errorNames } from './constants';
import { AppError } from './types';

export const isValidationError = (
  err: unknown
): err is mongoose.Error.ValidationError => {
  return err instanceof mongoose.Error.ValidationError;
};

export const isAppError = (err: unknown): err is AppError => {
  const appError = err as AppError;
  if (!appError) return false;
  return (
    appError.name === errorNames.INTERNAL_SERVER_ERROR ||
    appError.name === errorNames.NOT_FOUND ||
    appError.name === errorNames.BAD_REQUEST ||
    appError.name === errorNames.UNAUTHORIZED ||
    appError.name === errorNames.FORBIDDEN
  );
};
