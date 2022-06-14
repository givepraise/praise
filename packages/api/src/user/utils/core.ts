export const shortenEthAddress = (address: string): string => {
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};
