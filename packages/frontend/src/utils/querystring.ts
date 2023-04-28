export function qsToObject(qs: URLSearchParams): Record<string, string> {
  const result = {};
  for (const [key, value] of qs) {
    // each 'entry' is a [key, value] tuple
    result[key] = value;
  }
  return result;
}
