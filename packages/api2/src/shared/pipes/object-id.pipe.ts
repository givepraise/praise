import { Types, isObjectIdOrHexString } from 'mongoose';
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ObjectIdPipe implements PipeTransform {
  transform(value: any) {
    if (isObjectIdOrHexString(value)) {
      return new Types.ObjectId(value);
    }
    throw new BadRequestException('Value is not a valid ObjectId');
  }
}
