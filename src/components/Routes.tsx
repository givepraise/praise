import Nav from "@/components/Nav";
import LoginPage from "@/pages/Login";
import MainPage from "@/pages/Main";
import { useAuthRecoilValue } from "@/store/api";
import { ROLE_ADMIN, SessionToken, UserRoles } from "@/store/auth";
import * as localStorage from "@/store/localStorage";
import { useWeb3React } from "@web3-react/core";
import React, { FC } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { useRecoilState } from "recoil";

const PeriodsCreateUpdatePage = React.lazy(
  () => import("@/pages/Periods/CreateUpdate")
);
const PeriodsPage = React.lazy(() => import("@/pages/Periods/Periods"));
const QuantifierPoolPage = React.lazy(() => import("@/pages/Pool"));

interface LoggedInOnlyRouteProps {
  exact?: boolean;
  path: string;
}
// A Route that requires user to be logged in
const LoggedInOnlyRoute: FC<LoggedInOnlyRouteProps> = ({
  children,
  ...props
}) => {
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
  const userRoles = useAuthRecoilValue(UserRoles);

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
        <AuthRoute roles={[ROLE_ADMIN]} path={`/pool`}>
          <QuantifierPoolPage />
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
            <div className="w-[762px] pt-5 mx-auto">
              <SubPages />
            </div>
          </div>
        </div>
      </LoggedInOnlyRoute>
    </Switch>
  );
};

export default Routes;
