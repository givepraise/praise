import { AuthQuery, NonceQuery } from "@/store/auth";
import { loadSessionToken, saveSessionToken } from "@/store/localStorage";
import { useWeb3React } from "@web3-react/core";
import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";

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

    const sessionId = loadSessionToken(ethAccount);

    const history = useHistory();
    const location = useLocation<LocationState>();

    // 1. Fetch nonce from server
    const nonce = useRecoilValue(NonceQuery({ ethAccount }));

    // 4. Verify signature with server
    const session = useRecoilValue(
      AuthQuery({ ethAccount, message, signature })
    );

    // 2. Generate login message to sign
    React.useEffect(() => {
      if (!ethAccount || !nonce) return;
      setMessage(generateLoginMessage(ethAccount, nonce));
    }, [ethAccount, nonce]);

    // 5. Save session id for future api calls
    React.useEffect(() => {
      if (!ethAccount || !session) return;
      saveSessionToken(ethAccount, session.accessToken);
    }, [ethAccount, session]);

    // 6. Redirect after login
    React.useEffect(() => {
      if (!sessionId) return;
      const { from } = location.state || { from: { pathname: "/" } };
      setTimeout(() => {
        history.replace(from);
      }, 1000);
    }, [sessionId, location, history]);

    const signLoginMessage = async () => {
      // 3. Sign the message using Metamask
      const _signature: any = await ethLibrary.getSigner().signMessage(message);
      if (_signature) setSignature(_signature);
    };

    if (!nonce)
      return (
        <div>
          <button className="inline-block px-3 py-2 text-base font-semibold text-gray-700 uppercase bg-gray-500 rounded-lg">
            Sign login message
          </button>
        </div>
      );

    if (sessionId)
      return (
        <div>
          <button className="inline-block px-3 py-2 text-base font-semibold text-gray-700 uppercase bg-gray-500 rounded-lg">
            Logged in
          </button>
        </div>
      );

    return (
      <div>
        <button
          className="inline-block px-3 py-2 text-base font-semibold text-white uppercase bg-green-700 rounded-lg"
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
