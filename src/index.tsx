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
import { loadSessionToken } from "./spring/auth";
import "./styles/globals.css";

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

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Router>
          <div className="bg-green-900">
            <Header />
            <main>
              <Switch>
                <PrivateRoute exact path="/">
                  <MainPage />
                </PrivateRoute>
                <Route exact path="/login">
                  <LoginPage />
                </Route>
              </Switch>
            </main>
          </div>
        </Router>
      </Web3ReactProvider>
    </RecoilRoot>
  </React.StrictMode>,

  document.getElementById("root")
);
