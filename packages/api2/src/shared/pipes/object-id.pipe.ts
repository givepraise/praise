import { Types, isObjectIdOrHexString } from 'mongoose';
import { Injectable, PipeTransform } from '@nestjs/common';
import { errorMessages } from '../exceptions/error-messages';
import { ApiException } from '../exceptions/api-exception';

/*
 * This pipe is used to transform a string to a mongoose ObjectId.
 */
@Injectable()
export class ObjectIdPipe implements PipeTransform {
  transform(value: any) {
    if (isObjectIdOrHexString(value)) {
      return new Types.ObjectId(value);
    }
    throw new ApiException(errorMessages.VALUE_IS_NOT_A_VALID_OBJECT_ID);
  }
}
