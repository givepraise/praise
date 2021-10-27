import { isApiResponseOk, useAuthApiQuery } from "@/store/api";
import { Auth, AuthQuery, Nonce, NonceQuery, SessionToken } from "@/store/auth";
import * as localStorage from "@/store/localStorage";
import { useWeb3React } from "@web3-react/core";
import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";

interface LocationState {
  from: {
    pathname: string;
  };
}
const generateLoginMessage = (
  account: string | undefined,
  nonce: string
): string => {
  return (
    "SIGN THIS MESSAGE TO LOGIN TO PRAISE.\n\n" +
    `ADDRESS:\n${account}\n\n` +
    `NONCE:\n${nonce}`
  );
};

export default function LoginButton() {
  const LoginButtonInner = () => {
    const { account: ethAccount, library: ethLibrary } = useWeb3React();
    const [message, setMessage] = React.useState<string | any>(undefined);
    const [signature, setSignature] = React.useState<string | any>(undefined);
    const [sessionToken, setSessionToken] = useRecoilState(SessionToken);
    const history = useHistory();
    const location = useLocation<LocationState>();

    // 1. Fetch nonce from server
    const nonceResponse = useAuthApiQuery(NonceQuery({ ethAccount }));

    // 4. Verify signature with server
    const sessionResponse = useAuthApiQuery(
      AuthQuery({ ethAccount, message, signature })
    );

    // 2. Generate login message to sign
    React.useEffect(() => {
      if (!ethAccount || !nonceResponse) return;
      if (isApiResponseOk(nonceResponse)) {
        const nonceData = nonceResponse.data as Nonce;
        setMessage(generateLoginMessage(ethAccount, nonceData.nonce));
      }
    }, [ethAccount, nonceResponse]);

    // 5. Authetication response
    React.useEffect(() => {
      if (!ethAccount || !sessionResponse) return;
      if (isApiResponseOk(sessionResponse)) {
        const sessionData = sessionResponse.data as Auth;
        // Save session id for future api calls
        localStorage.setSessionToken(ethAccount, sessionData.accessToken);
        // Set session token in global state
        setSessionToken(sessionData.accessToken);
      }
    }, [ethAccount, sessionResponse, setSessionToken]);

    // 6. Redirect after login
    React.useEffect(() => {
      if (!sessionToken) return;
      const { from } = location.state || { from: { pathname: "/" } };
      setTimeout(() => {
        history.replace(from);
      }, 1000);
    }, [sessionToken, location, history]);

    const signLoginMessage = async () => {
      // 3. Sign the message using Metamask
      const _signature: any = await ethLibrary.getSigner().signMessage(message);
      if (_signature) setSignature(_signature);
    };

    if (!nonceResponse)
      return (
        <div>
          <button className="px-4 py-2 font-bold text-gray-500 uppercase bg-gray-700 rounded cursor-default">
            Sign login message
          </button>
        </div>
      );

    if (sessionToken)
      return (
        <div>
          <button className="px-4 py-2 font-bold text-gray-500 uppercase bg-gray-700 rounded cursor-default">
            Logged in
          </button>
        </div>
      );

    return (
      <div>
        <button
          className="px-4 py-2 font-bold text-white uppercase bg-black rounded hover:bg-gray-700"
          onClick={signLoginMessage}
        >
          Sign login message
        </button>
      </div>
    );
  };

  return (
    <React.Suspense fallback={null}>
      <LoginButtonInner />
    </React.Suspense>
  );
}
