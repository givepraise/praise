export function valueToValueRealized(
  value: string,
  type: string,
): string | string[] | boolean | number | number[] | undefined {
  if (!value) return undefined;

  if (type === 'Integer') return Number.parseInt(value);
  if (type === 'Float') return Number.parseFloat(value);
  if (type === 'Boolean') return value === 'true' ? true : false;
  if (type === 'IntegerList')
    return value.split(',').map((v: string) => Number.parseInt(v.trim()));
  if (type === 'StringList')
    return value.split(',').map((v: string) => v.trim());
  if (type === 'Image')
    return `${process.env.API_URL as string}/uploads/${value}`;
  if (type === 'JSON') return value ? JSON.parse(value) : [];

  // Types "String" and "Textarea" are not converted
  return value;
}
