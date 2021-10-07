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
import Header from "./components/Header";
import LoginPage from "./pages/Login";
import MainPage from "./pages/Main";
import { loadSessionToken } from "./store/localStorage";
import "./styles/globals.css";

const LOAD_DELAY = 500;

function getLibrary(provider: ExternalProvider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

interface PrivateRouteProps {
  exact: boolean;
  path: string;
}
const PrivateRoute: FC<PrivateRouteProps> = ({ children, ...rest }) => {
  const { account: ethAccount } = useWeb3React();
  console.log(ethAccount);
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

const DelayedRoutes = () => {
  const [delay, setDelay] = React.useState<boolean>(true);

  React.useEffect(() => {
    setTimeout(() => {
      setDelay(false);
    }, LOAD_DELAY);
  }, []);

  if (delay) return null;

  return (
    <Switch>
      <PrivateRoute exact path="/">
        <MainPage />
      </PrivateRoute>
      <Route exact path="/login">
        <LoginPage />
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
            <Header />
            <main>
              <DelayedRoutes />
            </main>
          </div>
        </Router>
      </Web3ReactProvider>
    </RecoilRoot>
  </React.StrictMode>,

  document.getElementById("root")
);
