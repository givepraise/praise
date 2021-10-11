import { ExternalProvider, Web3Provider } from "@ethersproject/providers";
import { useWeb3React, Web3ReactProvider } from "@web3-react/core";
import React, { FC } from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import { RecoilRoot } from "recoil";
import EthConnection from "./components/EthConnection";
import Nav from "./components/Nav";
import LoginPage from "./pages/Login";
import MainPage from "./pages/Main";
import PeriodsCreateUpdatePage from "./pages/Periods/CreateUpdate";
import Periods from "./pages/Periods/Periods";
import { loadSessionToken } from "./store/localStorage";
import "./styles/globals.css";

const LOAD_DELAY = 500;

function getLibrary(provider: ExternalProvider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

interface PrivateRouteProps {
  exact?: boolean;
  path: string;
}
const PrivateRoute: FC<PrivateRouteProps> = ({ children, ...rest }) => {
  const { account: ethAccount } = useWeb3React();
  const sessionId = loadSessionToken(ethAccount);
  return (
    <Route
      {...rest}
      render={({ location }) =>
        sessionId ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

const DelayedLoading: FC<any> = ({ children }) => {
  const [delay, setDelay] = React.useState<boolean>(true);

  React.useEffect(() => {
    setTimeout(() => {
      setDelay(false);
    }, LOAD_DELAY);
  }, []);

  if (delay) return null;
  return children;
};

const SubPages = () => {
  return (
    <Switch>
      <Route exact path={`/periods`}>
        <Periods />
      </Route>
      <Route path={`/periods/createupdate`}>
        <PeriodsCreateUpdatePage />
      </Route>
      <Route exact path="/">
        <MainPage />
      </Route>
    </Switch>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Router>
          <div>
            <EthConnection />
            <main className="font-sans">
              <DelayedLoading>
                <Switch>
                  <Route exact path="/login">
                    <LoginPage />
                  </Route>
                  <PrivateRoute path="/">
                    <div className="flex min-h-screen">
                      <Nav />
                      <div className="flex w-full">
                        <div className="w-[762px] pt-5 mx-auto">
                          <SubPages />
                        </div>
                      </div>
                    </div>
                  </PrivateRoute>
                </Switch>
              </DelayedLoading>
            </main>
          </div>
        </Router>
      </Web3ReactProvider>
    </RecoilRoot>
  </React.StrictMode>,

  document.getElementById("root")
);
