import * as dotenv from 'dotenv';
import 'express-async-errors';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import { ErrorCodesInterface } from './types';

dotenv.config({ path: path.join(__dirname, '..', '..', '/.env') });

// Strings
export const paramMissingError =
  'One or more of the required parameters was missing.';
export const loginFailedErr = 'Login failed';

// Numbers
export const pwdSaltRounds = 12;

// Cookie Properties
export const cookieProps = Object.freeze({
  key: 'ExpressGeneratorTs',
  secret: process.env.COOKIE_SECRET,
  options: {
    httpOnly: true,
    signed: true,
    path: process.env.COOKIE_PATH,
    maxAge: Number(process.env.COOKIE_EXP),
    domain: process.env.COOKIE_DOMAIN,
    secure: process.env.SECURE_COOKIE === 'true',
  },
});

export enum RouteType {
  admin = 'ADMIN',
  user = 'USER',
}

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
