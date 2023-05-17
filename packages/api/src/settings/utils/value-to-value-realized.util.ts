import { SettingType } from '../enums/setting-type.enum';

export function valueToValueRealized(
  value: string,
  type: SettingType,
): string | string[] | boolean | number | number[] | undefined {
  if (!value) return undefined;

  switch (type) {
    case SettingType.INTEGER:
      return Number.parseInt(value);
    case SettingType.FLOAT:
      return Number.parseFloat(value);
    case SettingType.BOOLEAN:
      return value === 'true' ? true : false;
    case SettingType.INTEGERLIST:
      return value.split(',').map((v: string) => Number.parseInt(v.trim()));
    case SettingType.STRINGLIST:
      return value.split(',').map((v: string) => v.trim()) as string[];
    case SettingType.IMAGE:
      return `${process.env.PINATA_BASE_URL}${value}`;
    // return process.env.NODE_ENV === 'development'
    //   ? `${process.env.API_URL as string}/uploads/${value}`
    //   : `${process.env.API_URL as string}:${
    //       process.env.API_PORT as string
    //     }/uploads/${value}`;
    case SettingType.JSON:
      return value ? JSON.parse(value) : [];
    default:
      return value;
  }
}
