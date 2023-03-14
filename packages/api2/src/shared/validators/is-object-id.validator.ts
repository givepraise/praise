import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Types } from 'mongoose';

@ValidatorConstraint({ name: 'IsObjectId' })
@Injectable()
export class IsObjectIdRule implements ValidatorConstraintInterface {
  validate(value: string | Types.ObjectId) {
    return Types.ObjectId.isValid(value);
  }

  defaultMessage() {
    return `($value) is not a valid ObjectId.`;
  }
}

export function IsObjectId(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsEthIsObjectIdAddress',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsObjectIdRule,
    });
  };
}
