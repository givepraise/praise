export const hasMetaMask = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (window as any).ethereum !== 'undefined';
};
