/**
 * Shorten ethereum address to a string formatted as:
 *  0x, first 4 digits, ellipsis, last 4 digits
 *
 * @exports
 * @param {string} address
 * @returns {string}
 */
export const shortenEthAddress = (address: string): string => {
  if (!address) return address;
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

/**
 * Parse a stringified JSON object to a JS object. Supports BigInts.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const toObject = (obj: any): any => {
  //TODO: type this better
  return JSON.parse(
    JSON.stringify(
      obj,
      (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
    )
  );
};
