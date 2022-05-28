import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { SignMessageButton } from '@/components/auth/SignMessageButton';
import { useRecoilValue } from 'recoil';
import { AccessToken } from '@/model/auth';
import { useHistory } from 'react-router-dom';
import LoaderSpinner from '@/components/LoaderSpinner';
import EthAccount from '@/components/EthAccount';

interface Props {
  children: JSX.Element;
  onSignSuccess(signature: string): void;
  message?: string;
  buttonText?: string;
}

const SignMessageLayout = ({
  children,
  onSignSuccess,
  message = undefined,
  buttonText = 'Sign Message',
}: Props): JSX.Element => {
  const { data, isLoading } = useAccount();
  const accessToken = useRecoilValue(AccessToken);
  const history = useHistory();

  if (accessToken) {
    history.replace('/');
  }

  return (
    <div className="w-full">
      <div className="flex flex-col w-full h-screen">
        <div className="w-full p-5 text-2xl font-bold">
          <FontAwesomeIcon icon={faPrayingHands} size="1x" className="m-2" />
        </div>
        <div className="p-4 py-8 m-auto border border-solid rounded-lg shadow-sm bg-gray-50 w-96 space-y-8">
          {children}

          {isLoading && !data && !message ? (
            <LoaderSpinner />
          ) : (
            <div className="w-full flex justify-center items-center">
              {data ? (
                <div>
                  <div className="text-lg font-semibold text-center mb-2">
                    Connected as
                  </div>
                  <div>
                    <EthAccount />
                  </div>
                </div>
              ) : (
                <ConnectButton showBalance={false} accountStatus="address" />
              )}
            </div>
          )}

          {data && message && (
            <div className="w-full flex justify-center items-center">
              <SignMessageButton
                text={buttonText}
                message={message}
                onSignSuccess={onSignSuccess}
                onSignError={(): void => void toast.error('Login denied')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignMessageLayout;
