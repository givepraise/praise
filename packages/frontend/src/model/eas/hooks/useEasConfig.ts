import { easConfig } from '../eas.config';

export function useEasConfig(chainId?: number) {
  if (!chainId) {
    return undefined;
  }
  const easContractAddress = easConfig.find((c) => c.id === chainId);
  if (!easContractAddress) {
    return undefined;
  }
  return easContractAddress;
}
