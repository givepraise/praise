import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ethers } from 'ethers';
import { Types } from 'mongoose';

@ValidatorConstraint({ name: 'IsEthAddress' })
@Injectable()
export class IsEthAddressRule implements ValidatorConstraintInterface {
  validate(value: string) {
    return ethers.utils.isAddress(value);
  }

  defaultMessage() {
    return `($value) is not a valid Ethereum address.`;
  }
}

export function IsEthAddress(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsEthAddress',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsEthAddressRule,
    });
  };
}

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
