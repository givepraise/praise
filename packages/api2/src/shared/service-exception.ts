/**
 * Throw `ServiceException` in services for "expected" errors. These errors will
 * be caught by the `ServiceExceptionFilter` and returned to the client as a
 * `400 Bad Request`. For unexpected errors, throw a regular `Error` and let the
 * `HttpExceptionFilter` handle it. Unexpected errors will be returned to the
 * client as a `500 Internal Server Error`.
 */
export class ServiceException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PraiseException';
  }
}
