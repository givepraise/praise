import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Settings } from '../schemas/settings.schema';

/**
 * Check if a given string can be parsed into a number
 *
 * @param {any} num
 * @returns {Boolean}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isNumeric(num: any): boolean {
  return !isNaN(num);
}

export function IsSettingValueAllowedBySettingType() {
  return function (object: Settings, propertyName: string) {
    registerDecorator({
      name: 'isSettingValueAllowedBySettingType',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      validator: {
        validate(value: any, args: ValidationArguments) {
          console.log('VALUE:', value);
          console.log('args:', args);
          console.log('OBJECT:', object);
          return false;
        },
      },
    });
  };
}
