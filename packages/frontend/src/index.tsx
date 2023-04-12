import './utils/polyfills';
import './styles/globals.css';

// eslint-disable-next-line import/no-unresolved
import '@rainbow-me/rainbowkit/styles.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import RecoilNexus from 'recoil-nexus';
import { LoadScreen } from '@/components/ui/LoadScreen';
import { Routes } from '@/navigation/Routes';
import { Web3Provider } from './providers/Web3Provider';
import { AwaitMetamaskInit } from './components/AwaitMetaMaskInit';
import { LightDarkTheme } from './components/LightDarkTheme';
import { ErrorBoundaryTopLevel } from './components/ErrorBoundaryTopLevel';

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <RecoilNexus />
      <Web3Provider>
        <Router>
          <main>
            <AwaitMetamaskInit>
              <LightDarkTheme>
                <React.Suspense fallback={<LoadScreen />}>
                  <ErrorBoundaryTopLevel>
                    <Routes />
                  </ErrorBoundaryTopLevel>
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
      </Web3Provider>
    </RecoilRoot>
  </React.StrictMode>,

  document.getElementById('root')
);
