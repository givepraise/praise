import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function MinLengthAllowEmpty(
  minLength: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'minLengthAllowEmpty',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (value === '') {
            return true; // Empty string is allowed
          }
          return value.length >= minLength;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must have a minimum length of ${minLength} characters`;
        },
      },
    });
  };
}
