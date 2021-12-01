import Nav from "@/components/Nav";
import {
  ROLE_ADMIN,
  ROLE_QUANTIFIER,
  SessionToken,
  UserRoles,
} from "@/model/auth";
import { EthState } from "@/model/eth";
import * as localStorage from "@/model/localStorage";
import LoginPage from "@/pages/Login";
import MainPage from "@/pages/Main";
import PeriodDetail from "@/pages/Periods/Detail";
import React, { FC } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";

const PeriodsCreateUpdatePage = React.lazy(
  () => import("@/pages/Periods/Create")
);
const PeriodsPage = React.lazy(() => import("@/pages/Periods/Periods"));
const QuantifierPoolPage = React.lazy(() => import("@/pages/Pool"));
const QuantifyPage = React.lazy(() => import("@/pages/Quantify"));

interface LoggedInOnlyRouteProps {
  exact?: boolean;
  path: string;
}
// A Route that requires user to be logged in
const LoggedInOnlyRoute: FC<LoggedInOnlyRouteProps> = ({
  children,
  ...props
}) => {
  const ethState = useRecoilValue(EthState);
  const [sessionToken, setSessionToken] = useRecoilState(SessionToken);
  React.useEffect(() => {
    setSessionToken(localStorage.getSessionToken(ethState.account));
  }, [ethState.account, setSessionToken]);
  // Token exists: Show content
  // Token undefined: Unknown state => wait
  // Token null: Token doesn't exist => login
  return (
    <Route
      {...props}
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

interface AuthRouteProps {
  exact?: boolean;
  path: string;
  roles: string[];
}
// A Route that takes an array of roles as argument and redirects
// to frontpage if user do not belong to any of the given roles
const AuthRoute: FC<AuthRouteProps> = ({ children, ...props }) => {
  const userRoles = useRecoilValue(UserRoles);

  let authenticated = false;
  for (const role of props.roles) {
    if (userRoles?.includes(role)) {
      authenticated = true;
      break;
    }
  }

  return (
    <Route
      {...props}
      render={({ location }) =>
        authenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/",
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
          <PeriodsPage />
        </Route>
        <AuthRoute roles={[ROLE_ADMIN]} path={`/periods/createupdate`}>
          <PeriodsCreateUpdatePage />
        </AuthRoute>
        <Route exact path={`/periods/:id`}>
          <PeriodDetail />
        </Route>
        <AuthRoute roles={[ROLE_ADMIN]} path={`/pool`}>
          <QuantifierPoolPage />
        </AuthRoute>
        <AuthRoute roles={[ROLE_QUANTIFIER]} path={`/quantify`}>
          <QuantifyPage />
        </AuthRoute>
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
      <LoggedInOnlyRoute path="/">
        <div className="flex min-h-screen">
          <Nav />
          <div className="flex w-full">
            <div className="w-[920px] pt-4 mx-auto px-5">
              <div>
                <SubPages />
              </div>
            </div>
          </div>
        </div>
      </LoggedInOnlyRoute>
    </Switch>
  );
};

export default Routes;
