import Nav from "@/components/Nav";
import LoginPage from "@/pages/Login";
import MainPage from "@/pages/Main";
import { SessionToken } from "@/store/auth";
import * as localStorage from "@/store/localStorage";
import { useWeb3React } from "@web3-react/core";
import React, { FC } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { useRecoilState } from "recoil";
import TopMenu from "./TopMenu";

const PeriodsCreateUpdatePage = React.lazy(
  () => import("@/pages/Periods/CreateUpdate")
);
const Periods = React.lazy(() => import("@/pages/Periods/Periods"));

interface PrivateRouteProps {
  exact?: boolean;
  path: string;
}
const PrivateRoute: FC<PrivateRouteProps> = ({ children, ...rest }) => {
  const { account: ethAccount } = useWeb3React();
  const [sessionToken, setSessionToken] = useRecoilState(SessionToken);
  React.useEffect(() => {
    setSessionToken(localStorage.getSessionToken(ethAccount));
  }, [ethAccount, setSessionToken]);

  // Token exists: Show content
  // Token undefined: Unknown state => wait
  // Token null: Token doesn't exist => login
  return (
    <Route
      {...rest}
      render={({ location }) =>
        sessionToken ? (
          children
        ) : sessionToken === undefined ? null : (
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

const SubPages = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
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
    </React.Suspense>
  );
};

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/login">
        <LoginPage />
      </Route>
      <PrivateRoute path="/">
        <div className="flex min-h-screen">
          <Nav />
          <div className="flex w-full">
            <div className="w-[762px] pt-5 mx-auto">
              <TopMenu />
              <SubPages />
            </div>
          </div>
        </div>
      </PrivateRoute>
    </Switch>
  );
};

export default Routes;
