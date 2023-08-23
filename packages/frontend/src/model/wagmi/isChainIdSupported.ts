import { supportedChains } from './wagmi.config';

export function isChainIdSupported(id: number) {
  return supportedChains.find((c) => c.id === id) !== undefined;
}
