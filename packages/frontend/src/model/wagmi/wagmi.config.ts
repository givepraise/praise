import { configureChains, createConfig, mainnet } from 'wagmi';

import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { optimism } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { WindowWithEnv } from '../../providers/types/window-with-env.type';

export const supportedChains = [mainnet, optimism];

const win = window as WindowWithEnv;

const REACT_APP_ALCHEMY_KEY =
  process.env.REACT_APP_ALCHEMY_KEY || win.REACT_APP_ALCHEMY_KEY || '';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  supportedChains,
  [alchemyProvider({ apiKey: REACT_APP_ALCHEMY_KEY }), publicProvider()]
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  publicClient,
  webSocketPublicClient,
});
