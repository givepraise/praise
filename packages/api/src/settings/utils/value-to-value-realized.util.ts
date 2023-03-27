export function valueToValueRealized(
  value: string,
  type: string,
): string | string[] | boolean | number | number[] | undefined {
  if (!value) return undefined;

  switch (type) {
    case 'Integer':
      return Number.parseInt(value);
    case 'Float':
      return Number.parseFloat(value);
    case 'Boolean':
      return value === 'true' ? true : false;
    case 'IntegerList':
      return value.split(',').map((v: string) => Number.parseInt(v.trim()));
    case 'StringList':
      return value.split(',').map((v: string) => v.trim()) as string[];
    case 'Image':
      return `${process.env.API_URL as string}:${
        process.env.API_PORT as string
      }/api/settings/uploads/${value}`;
    case 'JSON':
      return value ? JSON.parse(value) : [];
    default:
      return value;
  }
}
