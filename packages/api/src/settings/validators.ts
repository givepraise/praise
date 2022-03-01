import { SettingDocument } from './types';

function isNumeric(num: any): Boolean {
  return !isNaN(num);
}

export function fieldTypeValidator(this: SettingDocument): Boolean {
  if (this.type === 'Number') {
    return isNumeric(this.value);
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
      console.log(previous, parseInt(element));

      if (!isNumeric(element) || parseInt(element) < previous) {
        valid = false;
      }

      previous = parseInt(element);
    });

    return valid;
  }

  return typeof this.value === this.type;
}
