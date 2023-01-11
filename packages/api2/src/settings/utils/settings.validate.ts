function isNumeric(value: any) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Validate that a setting value is valid given its type.
 */
export function validate(value: string, type: string) {
  if (type === 'Float' || type === 'Integer') {
    return isNumeric(value);
  }

  if (
    type === 'String' ||
    type === 'Textarea' ||
    type === 'Image' ||
    type === 'Radio'
  ) {
    return typeof value === 'string';
  }

  if (type === 'Boolean') {
    return value.toString() === 'true' || value.toString() === 'false';
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

    return valid;
  }

  if (type === 'JSON') {
    try {
      const valueData = JSON.parse(value);
      return typeof valueData === 'object';
    } catch (error) {
      return false;
    }
  }

  if (type === 'StringList') {
    const valueArray = value.split(',').map((item: any) => item.trim());
    valueArray.forEach((element: any) => {
      if (typeof element !== 'string') {
        return false;
      }
    });
    return true;
  }

  return typeof value === type;
}
