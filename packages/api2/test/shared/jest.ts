import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import '@testing-library/jest-dom';
import supertest from 'supertest';

expect.extend({
  /**
   * Custom jest matcher to check if an object has been properly serialized by NestJS.
   */
  toBeProperlySerialized(received: any) {
    // If the object has a __v property, it has not been properly serialized.
    const fail = received.hasOwnProperty('__v');
    if (fail) {
      return {
        message: () => `expected object to be serialized but was not`,
        pass: false,
      };
    } else {
      return {
        message: () => `expected object to be serialized`,
        pass: true,
      };
    }
  },
});

expect.extend({
  /**
   * Custom jest matcher to check if an object is valid according to a class.
   */
  async toBeValidClass(received: any, expectedClass: ClassConstructor<any>) {
    const instance = plainToInstance(expectedClass, received);
    const validationErrors = await validate(instance);
    const pass = validationErrors.length === 0;
    if (pass) {
      return {
        message: () =>
          `expected object to be valid according to class ${expectedClass.name}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected object to be valid according to class ${
            expectedClass.name
          } but had the following validation errors:\n\nValidation errors: ${JSON.stringify(
            validationErrors,
            undefined,
            2,
          )}`,
        pass: false,
      };
    }
  },
});

// expect.extend({
//   expectOrThrow(response: supertest.Response, expectedCode) {
//     if (!response.statusCode === expectedCode) {
//       return {
//         message: () => `Expected response to have statusCode ${expectedCode}`,
//         pass: true,
//       };
//     } else {
//       return {
//         message: () =>
//           `Response did not to have expected statusCode ${expectedCode}\n\n`,
//         pass: false,
//       };
//     }
//   },
// });
