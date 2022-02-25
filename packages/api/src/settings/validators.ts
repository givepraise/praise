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
    console.log('here');
    console.log('VALUE:', this.value);
    return typeof this.value === 'boolean';
  }

  return typeof this.value === this.type;
}
