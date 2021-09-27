import { ExternalProvider, Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { RecoilRoot } from "recoil";
import Header from "./components/Header";
import LoginPage from "./pages/Login";
import "./styles/globals.css";

function getLibrary(provider: ExternalProvider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Router>
          <div className="bg-green-900">
            <Header />
            <main>
              <Switch>
                <Route exact path="/">
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
