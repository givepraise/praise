import { ExternalProvider, Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";
import React, { FC } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { RecoilRoot } from "recoil";
import EthConnection from "./components/EthConnection";
import Routes from "./components/Routes";
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

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Router>
          <div>
            <EthConnection />
            <main className="font-sans text-sm">
              <DelayedLoading>
                <Routes />
              </DelayedLoading>
            </main>
          </div>
        </Router>
      </Web3ReactProvider>
    </RecoilRoot>
  </React.StrictMode>,

  document.getElementById("root")
);
