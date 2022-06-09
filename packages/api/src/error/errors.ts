import { errorNames } from './constants';
import { ErrorInterface } from 'shared/dist/error/types';

class DomainError extends Error implements ErrorInterface {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class InternalServerError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = errorNames.INTERNAL_SERVER_ERROR;
  }
}

class BadRequestError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = errorNames.BAD_REQUEST;
  }
}

class UnauthorizedError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = errorNames.UNAUTHORIZED;
  }
}

class ForbiddenError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = errorNames.FORBIDDEN;
  }
}

class NotFoundError extends DomainError {
  constructor(resource: string) {
    super(`Resource ${resource} was not found.`);
    this.name = errorNames.NOT_FOUND;
  }
}

export {
  DomainError,
  InternalServerError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
};
