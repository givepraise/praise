/**
 * Throw `ServiceException` in services for "expected" errors. These errors will
 * be caught by the `ServiceExceptionFilter` and returned to the client as a
 * `400 Bad Request`. For unexpected errors, throw a regular `Error` and let the
 * `HttpExceptionFilter` handle it. Unexpected errors will be returned to the
 * client as a `500 Internal Server Error`.
 */
import { ErrorMessage } from '@/utils/errorMessages';

export class ServiceException extends Error {
  httpsStatusCode: number;
  code: number;
  description?: string;

  constructor(errorMessage: ErrorMessage, description?: string) {
    super(errorMessage.message);
    this.name = 'PraiseException';
    this.httpsStatusCode = errorMessage.httpStatusCode;
    this.code = errorMessage.code;
    this.description = description;
  }
}
