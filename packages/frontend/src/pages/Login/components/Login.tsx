import { isResponseOk } from '@/model/api';
import { ActiveTokenSet, AuthQuery, NonceQuery, SessionToken } from '@/model/auth';
import * as localStorage from '@/model/localStorage';
import { useWeb3React } from '@web3-react/core';
import { AuthResponse, NonceResponse } from 'api/dist/auth/types';
import React, { ReactElement } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';

interface LocationState {
  from: {
    pathname: string;
  };
}
const generateLoginMessage = (account: string, nonce: string): string => {
  return (
    'SIGN THIS MESSAGE TO LOGIN TO PRAISE.\n\n' +
    `ADDRESS:\n${account}\n\n` +
    `NONCE:\n${nonce}`
  );
};

const LoginButton: React.FC = (): ReactElement => {
  const LoginButtonInner: React.FC = (): ReactElement => {
    const { account: ethereumAddress, library: ethLibrary } = useWeb3React();
    const [message, setMessage] = React.useState<string | undefined>(undefined);
    const [signature, setSignature] = React.useState<string | undefined>(
      undefined
    );
    const sessionToken = useRecoilValue(SessionToken);
    const [tokenSet, setTokenSet] = useRecoilState(ActiveTokenSet);
    const history = useHistory();
    const location = useLocation<LocationState>();

    // 1. Fetch nonce from server
    const nonceResponse = useRecoilValue(NonceQuery(ethereumAddress));

    // 4. Verify signature with server
    const authResponse = useRecoilValue(
      AuthQuery({ ethereumAddress, message, signature })
    );

    // 2. Generate login message to sign
    React.useEffect(() => {
      if (!ethereumAddress || !nonceResponse) return;
      if (isResponseOk(nonceResponse)) {
        const nonceData = nonceResponse.data as NonceResponse;
        setMessage(generateLoginMessage(ethereumAddress, nonceData.nonce));
      }
    }, [ethereumAddress, nonceResponse]);

    // 5. Authetication response
    React.useEffect(() => {
      if (!ethereumAddress || !authResponse) return;
      if (isResponseOk(authResponse)) {
        const sessionData = authResponse.data as AuthResponse;
        // Save session id for future api calls
        localStorage.setSessionToken(ethereumAddress, sessionData.accessToken);
        // Set session token in global state
        setTokenSet({
          sessionToken: sessionData.accessToken,
          refreshToken: sessionData.refreshToken,
        });
      }
    }, [ethereumAddress, authResponse, setTokenSet, tokenSet]);

    // 6. Redirect after login
    React.useEffect(() => {
      if (!sessionToken) return;
      const { from } = location.state || { from: { pathname: '/' } };
      setTimeout(() => {
        history.replace(from);
      }, 1000);
    }, [sessionToken, location, history]);

    const signLoginMessage = async (): Promise<void> => {
      // 3. Sign the message using Metamask
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _signature: any = await ethLibrary.getSigner().signMessage(message);
      if (_signature) setSignature(_signature);
    };

    if (!nonceResponse || !isResponseOk(nonceResponse)) {
      return (
        <div>
          <button className="px-4 py-2 font-bold text-gray-500 uppercase bg-gray-700 rounded cursor-default">
            Sign login message
          </button>
        </div>
      );
    }

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
          className="px-4 py-2 font-bold text-white uppercase bg-gray-800 rounded hover:bg-gray-700"
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
};

export { LoginButton };
