import LoaderSpinner from '@/components/LoaderSpinner';
import { AccessToken } from '@/model/auth';
import { EthState } from '@/model/eth';
import { requestApiAuth, requestNonce } from '@/utils/auth';
import { useWeb3React } from '@web3-react/core';
import React, { ReactElement } from 'react';
import { toast } from 'react-hot-toast';
import { useHistory, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

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

const LoginButton: React.FC = (): ReactElement | null => {
  const LoginButtonInner: React.FC = (): ReactElement | null => {
    const { library: ethLibrary } = useWeb3React();
    const [signatureReceived, setSignatureReceived] =
      React.useState<boolean>(false);
    const accessToken = useRecoilValue(AccessToken);
    const { account: ethereumAddress } = useRecoilValue(EthState);
    const history = useHistory();
    const location = useLocation<LocationState>();

    const signLoginMessage = async (): Promise<void> => {
      if (!ethereumAddress) return;

      try {
        // 1. Fetch nonce from server & create message
        const nonce = await requestNonce(ethereumAddress);

        // 2. User signs the message using Metamask
        const message = generateLoginMessage(ethereumAddress, nonce);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const signature: any = await ethLibrary
          .getSigner()
          .signMessage(message);
        setSignatureReceived(true);

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

    const handleSignButtonClick = (): void => {
      void signLoginMessage();
    };

    // 4. Redirect after login success

    if (accessToken) {
      const { from } = location.state || { from: { pathname: '/' } };
      setTimeout(() => {
        history.replace(from);
      }, 1000);
    }

    if (!accessToken && !signatureReceived) {
      return (
        <button
          className="px-4 py-2 font-bold text-white uppercase bg-gray-800 rounded hover:bg-gray-700"
          onClick={handleSignButtonClick}
        >
          Sign login message
        </button>
      );
    } else {
      return <LoaderSpinner />;
    }
  };

  return (
    <React.Suspense fallback={null}>
      <LoginButtonInner />
    </React.Suspense>
  );
};

export { LoginButton };
