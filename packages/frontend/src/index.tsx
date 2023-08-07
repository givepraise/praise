import './utils/polyfills';
import './styles/globals.css';
// eslint-disable-next-line import/no-unresolved
import '@rainbow-me/rainbowkit/styles.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
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
import PlausibleAnalytics from '@/components/PlausibleAnalytics';
import { SafeProvider } from './model/safe/components/SafeProvider';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <RecoilRoot>
      <RecoilNexus />
      <Web3Provider>
        <SafeProvider>
          <Router>
            <main>
              <AwaitMetamaskInit>
                <LightDarkTheme>
                  <React.Suspense fallback={<LoadScreen />}>
                    <ErrorBoundaryTopLevel>
                      <Routes />
                    </ErrorBoundaryTopLevel>
                    <PlausibleAnalytics />
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
        </SafeProvider>
      </Web3Provider>
    </RecoilRoot>
  </React.StrictMode>
);
