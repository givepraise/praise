import { ServiceException } from '@/shared/exceptions/service-exception';
import { errorMessages } from '@/utils/errorMessages';

function isNumeric(value: any) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Validate that a setting value is valid given its type.
 */
export function validateSetting(
  value: string,
  type: string,
): { valid: boolean; value: string } {
  if (type === 'Float' || type === 'Integer') {
    return {
      valid: isNumeric(value),
      value,
    };
  }

  if (
    type === 'String' ||
    type === 'Textarea' ||
    type === 'Image' ||
    type === 'Radio'
  ) {
    return { valid: typeof value === 'string', value };
  }

  if (type === 'Boolean') {
    return {
      valid: value.toString() === 'true' || value.toString() === 'false',
      value,
    };
  }

  if (type === 'IntegerList') {
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

  if (type === 'JSON') {
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

  if (type === 'StringList') {
    let valid = true;
    const valueArray = value.split(',').map((item: any) => item.trim());
    valueArray.forEach((element: any) => {
      if (typeof element !== 'string') {
        valid = false;
      }
    });
    return { valid, value: valueArray.join(',') };
  }

  throw new ServiceException(
    errorMessages.UNKNOWN_SETTING_TYPE,
    `Unknown setting type ${type}.`,
  );
}
