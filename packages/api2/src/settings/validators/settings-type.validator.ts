import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';
import { SetSettingDto } from '../dto/set-setting.dto';

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

@ValidatorConstraint({
  name: 'IsSettingValueAllowedBySettingType',
  async: false,
})
@Injectable()
export class IsSettingValueAllowedBySettingTypeRule
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    if (!value) {
      return true;
    }

    const object = args.object as SetSettingDto;

    if (object.type === 'Float' || object.type === 'Integer') {
      return isNumeric(value);
    }

    if (
      object.type === 'String' ||
      object.type === 'Textarea' ||
      object.type === 'Image' ||
      object.type === 'Radio'
    ) {
      return typeof value === 'string';
    }

    if (object.type === 'Boolean') {
      return value === 'true' || value === 'false';
    }

    if (object.type === 'IntegerList') {
      let valid = true;
      let previous = 0;
      const valueArray = value.split(',').map((item: any) => item.trim());

      valueArray.forEach((element: any) => {
        if (!isNumeric(element) || parseInt(element) < previous) {
          valid = false;
        }

        previous = parseInt(element);
      });

      return valid;
    }

    if (object.type === 'JSON') {
      const valueData = JSON.parse(value);
      return typeof valueData === 'object';
    }

    if (object.type === 'StringList') {
      const valueArray = value.split(',').map((item: any) => item.trim());
      valueArray.forEach((element: any) => {
        if (typeof element !== 'string') {
          return false;
        }
      });
      return true;
    }

    return typeof value === object.type;
  }

  defaultMessage(args: ValidationArguments) {
    return `'${args.value}' is not correct value for this setting type.`;
  }
}

export function IsSettingValueAllowedBySettingType(
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsSettingValueAllowedBySettingTypeRule,
    });
  };
}
