import {
  ClassSerializerInterceptor,
  PlainLiteralObject,
  Type,
} from '@nestjs/common';
import { ClassTransformOptions, plainToClass } from 'class-transformer';
import { Document } from 'mongoose';
import { PaginationModel } from 'mongoose-paginate-ts';

/**
 * This interceptor is used to transform service responses to class instances. Service responses
 * should be plain objects, but we want to return class instances. Interceptor supports paginated
 * responses extending `PaginationModel` as well as arrays of objects and single objects.
 */
export function MongooseClassSerializerInterceptor(
  classToIntercept: Type,
): typeof ClassSerializerInterceptor {
  return class Interceptor extends ClassSerializerInterceptor {
    private changePlainObjectToClass(obj: PlainLiteralObject) {
      if (obj instanceof Document) {
        return plainToClass(classToIntercept, obj.toJSON());
      }
      return plainToClass(classToIntercept, obj);
    }

    private prepareResponse(
      response: PlainLiteralObject | PlainLiteralObject[],
    ) {
      if (response instanceof PaginationModel) {
        return {
          ...response,
          docs: response.docs.map(this.changePlainObjectToClass),
        };
      }
      if (Array.isArray(response)) {
        return response.map(this.changePlainObjectToClass);
      }

      return this.changePlainObjectToClass(response);
    }

    serialize(
      response: PlainLiteralObject | PlainLiteralObject[],
      options: ClassTransformOptions,
    ) {
      return super.serialize(this.prepareResponse(response), options);
    }
  };
}
