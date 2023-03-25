import { Types, isObjectIdOrHexString } from 'mongoose';
import { Injectable, PipeTransform } from '@nestjs/common';
import { errorMessages } from '@/utils/errorMessages';
import { ServiceException } from '@/shared/exceptions/service-exception';

/*
 * This pipe is used to transform a string to a mongoose ObjectId.
 */
@Injectable()
export class ObjectIdPipe implements PipeTransform {
  transform(value: any) {
    if (isObjectIdOrHexString(value)) {
      return new Types.ObjectId(value);
    }
    throw new ServiceException(errorMessages.VALUE_IS_NOT_A_VALID_OBJECT_ID);
  }
}
