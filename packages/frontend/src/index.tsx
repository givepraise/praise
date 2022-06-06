import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { Web3ReactProvider } from '@web3-react/core';
import React from 'react';
import ReactDOM from 'react-dom';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import RecoilNexus from 'recoil-nexus';
import { useErrorBoundary } from 'use-error-boundary';
import EthConnection from './components/EthConnection';
import Routes from './navigation/Routes';
import ErrorPage from './pages/ErrorPage';
import LoadScreen from '@/components/LoadScreen';
import './styles/globals.css';

const LOAD_DELAY = 500;

function getLibrary(provider: ExternalProvider): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

interface DelayedLoadingProps {
  children: JSX.Element;
}
const DelayedLoading = ({
  children,
}: DelayedLoadingProps): JSX.Element | null => {
  const [delay, setDelay] = React.useState<boolean>(true);

  React.useEffect(() => {
    setTimeout(() => {
      setDelay(false);
    }, LOAD_DELAY);
  }, []);

  // Possibility to add loader here
  if (delay) return null;
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

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <RecoilNexus />
      <Web3ReactProvider getLibrary={getLibrary}>
        <Router>
          <EthConnection />
          <main>
            <DelayedLoading>
              <React.Suspense fallback={<LoadScreen />}>
                <ErrorBoundary>
                  <Routes />
                </ErrorBoundary>
              </React.Suspense>
            </DelayedLoading>
            <Toaster
              position="bottom-right"
              reverseOrder={false}
              toastOptions={{ duration: 3000 }}
            />
          </main>
        </Router>
      </Web3ReactProvider>
    </RecoilRoot>
  </React.StrictMode>,

  document.getElementById('root')
);
