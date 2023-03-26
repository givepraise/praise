import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ethers } from 'ethers';

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
