import { Transform } from 'class-transformer';

/**
 *  Decorator for exposing a `Types.ObjectId` property as a string
 */
export const ExposeId = () => (target: any, propertyKey: string) => {
  Transform(({ obj, key }) => {
    return obj[key].toString();
  })(target, propertyKey);
};
