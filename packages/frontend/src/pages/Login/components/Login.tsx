import LoaderSpinner from '@/components/LoaderSpinner';
import { AccessToken } from '@/model/auth';
import { EthState } from '@/model/eth';
import { useWeb3React } from '@web3-react/core';
import React, { ReactElement } from 'react';
import toast from 'react-hot-toast';
import { useHistory, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { requestApiAuth, requestNonce } from '@/utils/auth';

interface CodedError {
  message?: string;
  code?: number;
}
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
    const { library: ethLibrary } = useWeb3React();
    const [message, setMessage] = React.useState<string | undefined>(undefined);
    const accessToken = useRecoilValue(AccessToken);
    const { account: ethereumAddress } = useRecoilValue(EthState);
    const history = useHistory();
    const location = useLocation<LocationState>();

    // 1. Fetch nonce from server & create message
    React.useEffect(() => {
      if (!ethereumAddress) return;

      const createLoginMessage = async (): Promise<void> => {
        const nonce = await requestNonce(ethereumAddress);
        const _message = generateLoginMessage(ethereumAddress, nonce);

        setMessage(_message);
      };
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      createLoginMessage();
    }, [ethereumAddress]);

    // 2. User signs the message using Metamask
    const signLoginMessage = async (): Promise<void> => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const signature: any = await ethLibrary
          .getSigner()
          .signMessage(message);

        // 3. Verify signature with server
        await requestApiAuth({ ethereumAddress, message, signature });
      } catch (err) {
        if ((err as CodedError).code === 4001) {
          toast.error('You declined login');
        } else {
          toast.error('Login failed');
        }
      }
    };

    // 4. Redirect after login success
    React.useEffect(() => {
      if (!accessToken) return;
      const { from } = location.state || { from: { pathname: '/' } };
      setTimeout(() => {
        history.replace(from);
      }, 1000);
    }, [accessToken, location, history]);

    if (!message) {
      return (
        <button className="px-4 py-2 font-bold text-gray-500 uppercase bg-gray-700 rounded cursor-default">
          Sign login message
        </button>
      );
    } else if (accessToken) {
      return <LoaderSpinner />;
    } else {
      return (
        <button
          className="px-4 py-2 font-bold text-white uppercase bg-gray-800 rounded hover:bg-gray-700"
          onClick={signLoginMessage}
        >
          Sign login message
        </button>
      );
    }
  };

  return (
    <React.Suspense fallback={null}>
      <LoginButtonInner />
    </React.Suspense>
  );
};

export { LoginButton };
