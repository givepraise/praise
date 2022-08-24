import React from 'react';
import ReactDOM from 'react-dom';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';
import { RecoilRoot, useRecoilValue } from 'recoil';
import RecoilNexus from 'recoil-nexus';
import { useErrorBoundary } from 'use-error-boundary';
// eslint-disable-next-line import/no-unresolved
import '@rainbow-me/rainbowkit/styles.css';
import {
  Chain,
  connectorsForWallets,
  wallet,
  RainbowKitProvider,
  lightTheme,
  Theme as RainbowTheme,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import merge from 'lodash/merge';
import { configureChains, createClient, WagmiConfig, chain } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { LoadScreen } from '@/components/ui/LoadScreen';
import { Theme } from '@/model/theme';
import { Routes } from '@/navigation/Routes';
import ErrorPage from './pages/ErrorPage';
import './styles/globals.css';

const LOAD_DELAY = 500;

const gnosisChain: Chain = {
  id: 100,
  name: 'Gnosis Chain',
  network: 'Gnosis Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'xDAI',
    symbol: 'xDAI',
  },
  rpcUrls: {
    default: 'https://rpc.gnosischain.com',
  },
  blockExplorers: {
    default: {
      name: 'BlockScout',
      url: 'https://blockscout.com/xdai/mainnet/',
    },
    blockscout: {
      name: 'BlockScout',
      url: 'https://blockscout.com/xdai/mainnet/',
    },
  },
  testnet: false,
};

const { chains, provider } = configureChains(
  [chain.mainnet, gnosisChain],
  [publicProvider()]
);

const needsInjectedWalletFallback =
  typeof window !== 'undefined' &&
  window.ethereum &&
  !window.ethereum.isMetaMask &&
  !window.ethereum.isCoinbaseWallet;

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      wallet.metaMask({ chains }),
      wallet.ledger({ chains }),
      wallet.coinbase({ appName: 'Praise', chains }),
      wallet.trust({ chains }),
      wallet.imToken({ chains }),
      wallet.walletConnect({ chains }),
      wallet.rainbow({ chains }),
      ...(needsInjectedWalletFallback ? [wallet.injected({ chains })] : []),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const customRainbowkitTheme = merge(lightTheme(), {
  colors: {
    accentColor: '#2d3748', // tailwind color gray-800
  },
  radii: {
    connectButton: '0.25rem', // tailwind radius 'rounded'
    modal: '0.25rem',
  },
} as RainbowTheme);

interface DelayedLoadingProps {
  children: JSX.Element;
}
/**
 * Load delay waiting for metamask/eth
 */
const AwaitMetamaskInit = ({
  children,
}: DelayedLoadingProps): JSX.Element | null => {
  const [delay, setDelay] = React.useState<boolean>(true);

  React.useEffect(() => {
    setTimeout(() => {
      setDelay(false);
    }, LOAD_DELAY);
  }, []);

  if (delay) return null;
  return children;
};

interface LightDarkThemeProps {
  children: JSX.Element;
}

const LightDarkTheme = ({
  children,
}: LightDarkThemeProps): JSX.Element | null => {
  const theme = useRecoilValue(Theme);

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme !== 'Light') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'Dark');
    } else {
      localStorage.setItem('theme', 'Light');
      root.classList.remove('dark');
    }
  }, [theme]);

  return children;
};

interface ErrorBoundaryProps {
  children: JSX.Element;
}
const ErrorBoundary = ({ children }: ErrorBoundaryProps): JSX.Element => {
  const { ErrorBoundary } = useErrorBoundary();

  return (
    <ErrorBoundary
      render={(): JSX.Element => children}
      renderError={({ error }): JSX.Element => <ErrorPage error={error} />}
    />
  );
};

const getRainbowTheme = (): RainbowTheme => {
  const currentMode = localStorage.getItem('theme');
  if (currentMode === 'Dark') {
    return darkTheme();
  }
  return customRainbowkitTheme;
};

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <RecoilNexus />
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} theme={getRainbowTheme()}>
          <Router>
            <main>
              <AwaitMetamaskInit>
                <LightDarkTheme>
                  <React.Suspense fallback={<LoadScreen />}>
                    <ErrorBoundary>
                      <Routes />
                    </ErrorBoundary>
                  </React.Suspense>
                </LightDarkTheme>
              </AwaitMetamaskInit>
              <Toaster
                position="bottom-right"
                reverseOrder={false}
                toastOptions={{ duration: 3000 }}
              />
            </main>
          </Router>
        </RainbowKitProvider>
      </WagmiConfig>
    </RecoilRoot>
  </React.StrictMode>,

  document.getElementById('root')
);
