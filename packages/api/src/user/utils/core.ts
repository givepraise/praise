/**
 * Shorten ethereum address to a string formatted as:
 *  0x, first 4 digits, ellipsis, last 4 digits
 *
 * @exports
 * @param {string} address
 * @returns {string}
 */
export const shortenEthAddress = (address: string): string => {
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};
