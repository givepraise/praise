import { SettingDocument } from './types';
import { isNumber } from 'lodash';

export function fieldTypeValidator(this: SettingDocument): Boolean {
  if (this.type === 'Number') {
    return isNumber(this.value);
  }

  if (this.type === 'String' || this.type === 'Textarea') {
    return typeof this.value === 'string';
  }

  if (this.type === 'Boolean') {
    return this.value === 'true' || this.value === 'false';
  }

  if (this.type === 'List') {
    let valid = true;
    let previous = 0;
    const valueArray = this.value.split(',').map((item) => item.trim());

    valueArray.forEach((element) => {
      if (!isNumber(element) || parseInt(element) < previous) {
        valid = false;
      }

      previous = parseInt(element);
    });

    return valid;
  }

  return typeof this.value === this.type;
}
