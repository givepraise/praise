import { ApiException } from '../../shared/exceptions/api-exception';
import { errorMessages } from '../../shared/exceptions/error-messages';
import { SettingType } from '../enums/setting-type.enum';

function isNumeric(value: any) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Validate that a setting value is valid given its type.
 */
export function validateSetting(
  value: string,
  type: SettingType,
): { valid: boolean; value: string } {
  if (type === SettingType.FLOAT || type === SettingType.INTEGER) {
    return {
      valid: isNumeric(value),
      value,
    };
  }

  if (
    type === SettingType.STRING ||
    type === SettingType.TEXTAREA ||
    type === SettingType.IMAGE ||
    type === SettingType.RADIO
  ) {
    return { valid: typeof value === 'string', value };
  }

  if (type === SettingType.BOOLEAN) {
    return {
      valid: value.toString() === 'true' || value.toString() === 'false',
      value,
    };
  }

  if (type === SettingType.INTEGERLIST) {
    let valid = true;
    let previous = 0;
    const valueArray = value.split(',').map((item: any) => item.trim());

    valueArray.forEach((element: any) => {
      if (!isNumeric(element) || parseInt(element) < previous) {
        valid = false;
      }

      previous = parseInt(element);
    });

    return { valid, value: valueArray.join(',') };
  }

  if (type === SettingType.JSON) {
    try {
      const valueData = JSON.parse(value);
      return {
        valid: typeof valueData === 'object',
        value: JSON.stringify(valueData, null, 2),
      };
    } catch (error) {
      return { valid: false, value };
    }
  }

  if (type === SettingType.STRINGLIST) {
    let valid = true;
    const valueArray = value.split(',').map((item: any) => item.trim());
    valueArray.forEach((element: any) => {
      if (typeof element !== 'string') {
        valid = false;
      }
    });
    return { valid, value: valueArray.join(',') };
  }

  throw new ApiException(
    errorMessages.UNKNOWN_SETTING_TYPE,
    `Unknown setting type ${type}.`,
  );
}
