export function qsToObject(qs: URLSearchParams): Record<string, string> {
  const result = {};
  for (const [key, value] of qs) {
    // each 'entry' is a [key, value] tuple
    result[key] = value;
  }
  return result;
}

type QueryType = {
  [key: string]: number | string | boolean;
};

export function objectToQs(query: QueryType): URLSearchParams {
  const stringifiedQuery: { [key: string]: string } = {};
  for (const [key, value] of Object.entries(query)) {
    stringifiedQuery[key] = String(value);
  }
  return new URLSearchParams(stringifiedQuery);
}
