import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { SignMessageButton } from '@/components/auth/SignMessageButton';
import { LoaderSpinner } from '@/components/ui/LoaderSpinner';
import { EthAccount } from '@/components/account/EthAccount';
import { Button } from '../components/ui/Button';

interface Props {
  children: JSX.Element;
  onSignSuccess(signature: string): void;
  message?: string;
  buttonText?: string;
}

export const SignMessageLayout = ({
  children,
  onSignSuccess,
  message = undefined,
  buttonText = 'Sign message',
}: Props): JSX.Element => {
  const { address, isConnecting } = useAccount();

  return (
    <div className="w-full">
      <div className="flex flex-col w-full h-screen">
        <div className="w-full p-5 text-2xl font-bold">
          <FontAwesomeIcon icon={faPrayingHands} size="1x" className="m-2" />
        </div>
        <div className="p-12 py-12 m-auto space-y-8 border-none rounded-none shadow-none md:p-10 md:border md:border-solid md:rounded-lg md:shadow-sm bg-none md:bg-warm-gray-50 w-96 dark:bg-slate-900">
          {children}

          {isConnecting && !address && !message ? (
            <LoaderSpinner />
          ) : (
            <div className="flex items-center justify-center w-full">
              {address ? (
                <div>
                  <div className="mb-2 text-lg font-semibold text-center">
                    Connected as
                  </div>
                  <EthAccount className="w-36" />
                </div>
              ) : (
                <ConnectButton showBalance={false} accountStatus="address" />
              )}
            </div>
          )}

          {address && (
            <div className="flex items-center justify-center w-full">
              {message && (
                <SignMessageButton
                  text={buttonText}
                  message={message}
                  onSignSuccess={onSignSuccess}
                  onSignError={(): void => void toast.error('Login denied')}
                />
              )}
              {!message && <LoaderSpinner />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
