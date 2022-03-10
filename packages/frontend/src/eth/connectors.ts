import { AbstractConnector } from '@web3-react/abstract-connector/dist';
import { InjectedConnector } from '@web3-react/injected-connector';

export const injected = new InjectedConnector({
  // Eth mainnet, test nets and a few others xDai, Polygon, etc.
  // Add more if requested, Praise does not perform any onchain actions
  supportedChainIds: [1, 3, 4, 5, 56, 61, 137, 100],
});

export function isConnected(connector: AbstractConnector | undefined): boolean {
  return injected === connector;
}
