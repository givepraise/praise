import { SettingDocument } from './types';
import { PeriodSettingDocument } from '@periodsettings/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isNumeric(num: any): Boolean {
  return !isNaN(num);
}

export function fieldTypeValidator(
  this: SettingDocument | PeriodSettingDocument
): Boolean {
  if (this.type === 'Float' || this.type === 'Integer') {
    return isNumeric(this.value);
  }

  if (this.type === 'Textarea' && this.key === 'PRAISE_FAQ') {
    let response = true;
    const data = JSON.parse(this.value);
    if (!data.faq) {
      response = false;
    }

    data.faq.forEach((item: any) => {
      if (!item.question || !item.answer) {
        response = false;
      }
    });

    return response;
  }

  if (
    this.type === 'String' ||
    this.type === 'Textarea' ||
    this.type === 'Image'
  ) {
    return typeof this.value === 'string';
  }

  if (this.type === 'Boolean') {
    return this.value === 'true' || this.value === 'false';
  }

  if (this.type === 'IntegerList') {
    let valid = true;
    let previous = 0;
    const valueArray = this.value.split(',').map((item) => item.trim());

    valueArray.forEach((element) => {
      if (!isNumeric(element) || parseInt(element) < previous) {
        valid = false;
      }

      previous = parseInt(element);
    });

    return valid;
  }

  return typeof this.value === this.type;
}
