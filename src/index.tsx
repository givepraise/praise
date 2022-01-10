import { ExternalProvider, Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";
import React, { FC } from "react";
import ReactDOM from "react-dom";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router } from "react-router-dom";
import { RecoilRoot } from "recoil";
import EthConnection from "./components/EthConnection";
import { handleErrors, isApiResponseError } from "./model/api";
import Routes from "./navigation/Routes";
import { LoadScreen } from "./startupLoader";
import "./styles/globals.css";

const LOAD_DELAY = 500;

function getLibrary(provider: ExternalProvider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

const DelayedLoading: FC<any> = ({ children }) => {
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

class ErrorBoundary extends React.Component {
  componentDidCatch(error: any, errorInfo: any) {
    if (isApiResponseError(error)) {
      handleErrors(error);
    }
  }

  render() {
    return this.props.children;
  }
}

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Router>
          <div>
            <EthConnection />
            <ErrorBoundary>
              <main className="font-mono text-sm">
                <DelayedLoading>
                  <React.Suspense fallback={<LoadScreen />}>
                    <Routes />
                    <Toaster
                      position="bottom-right"
                      reverseOrder={false}
                      toastOptions={{ duration: 3000 }}
                    />
                  </React.Suspense>
                </DelayedLoading>
              </main>
            </ErrorBoundary>
          </div>
        </Router>
      </Web3ReactProvider>
    </RecoilRoot>
  </React.StrictMode>,

  document.getElementById("root")
);
