import { safeConfig } from '../safe.config';

export function useSafeConfig(chainId?: number) {
  if (!chainId) {
    return undefined;
  }
  return safeConfig.find((c) => c.id === chainId);
}
