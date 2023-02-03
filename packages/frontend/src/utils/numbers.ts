/**
 * Convert a string in the format of "1,2,3,4" to an array of numbers
 */
export function stringToNumberArray(str: string): number[] {
  return str.split(',').map((value) => {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) return 0;
    return parsedValue;
  });
}
