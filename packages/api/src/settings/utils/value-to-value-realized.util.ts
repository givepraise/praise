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
      return process.env.PINATA_DEDICATED_GATEWAY
        ? `${process.env.PINATA_DEDICATED_GATEWAY as string}${value}`
        : `https://cloudflare-ipfs.com/ipfs/${value}`;
    case SettingType.JSON:
      return value ? JSON.parse(value) : [];
    default:
      return value;
  }
}
