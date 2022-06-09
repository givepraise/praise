import { StatusCodes } from 'http-status-codes';
import { ErrorCodesInterface } from 'shared/dist/error/types';

export const {
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} = StatusCodes;

export const errorNames = {
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'NotFound',
  BAD_REQUEST: 'BadRequest',
  INTERNAL_SERVER_ERROR: 'InternalServerError',
};

export const errorCodes: ErrorCodesInterface = {
  Unauthorized: UNAUTHORIZED,
  Forbidden: FORBIDDEN,
  NotFound: NOT_FOUND,
  BadRequest: BAD_REQUEST,
  InternalServerError: INTERNAL_SERVER_ERROR,
};
