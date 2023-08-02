// eslint-disable-next-line import/no-unresolved
import '@rainbow-me/rainbowkit/styles.css';
import {
  lightTheme,
  Theme as RainbowTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import merge from 'lodash/merge';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { optimism } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';

interface WindowWithEnv extends Window {
  REACT_APP_ALCHEMY_KEY?: string;
  REACT_APP_WALLETCONNECT_PROJECT_ID?: string;
}

const win = window as WindowWithEnv;

const REACT_APP_ALCHEMY_KEY =
  process.env.REACT_APP_ALCHEMY_KEY || win.REACT_APP_ALCHEMY_KEY;

const REACT_APP_WALLETCONNECT_PROJECT_ID =
  process.env.REACT_APP_WALLETCONNECT_PROJECT_ID ||
  win.REACT_APP_WALLETCONNECT_PROJECT_ID ||
  '';

const { chains, publicClient } = configureChains(
  [optimism],
  [
    alchemyProvider({
      apiKey: REACT_APP_ALCHEMY_KEY || '',
    }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Praise',
  projectId: REACT_APP_WALLETCONNECT_PROJECT_ID,
  chains,
});

const wagmiClient = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const customTheme = merge(lightTheme(), {
  colors: {
    accentColor: '#E1007F', // tailwind color gray-800
  },
  radii: {
    connectButton: '0.375rem', // tailwind radius 'rounded'
    modal: '0.375rem',
  },
} as RainbowTheme);

interface Web3ProviderProps {
  children: JSX.Element;
}

export function Web3Provider({ children }: Web3ProviderProps): JSX.Element {
  if (!REACT_APP_ALCHEMY_KEY) {
    throw new Error('REACT_APP_ALCHEMY_KEY is not set');
  }
  if (!REACT_APP_WALLETCONNECT_PROJECT_ID) {
    throw new Error('REACT_APP_WALLETCONNECT_PROJECT_ID is not set');
  }
  return (
    <WagmiConfig config={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        theme={customTheme}
        modalSize="compact"
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
