import { faSignIn, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/Button';
import { Box } from '../ui/Box';
import { useAccount } from 'wagmi';
import { requestApiAuth, requestNonce } from '@/utils/auth';
import { toast } from 'react-hot-toast';
import { generateLoginMessage } from '@/utils/message';
import { LoaderSpinner } from '../ui/LoaderSpinner';
import { EthAccount } from '../account/EthAccount';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SignMessageButton } from './SignMessageButton';

interface LoginDialogProps {
  open?: boolean;
  onClose(): void;
}

export const LoginDialog = ({
  open = false,
  onClose,
}: LoginDialogProps): JSX.Element => {
  const contentRef = useRef(null);
  const { address, isConnecting } = useAccount();

  const [message, setMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const generateNewMessage = async (address): Promise<void> => {
      try {
        const nonce = await requestNonce(address);
        const newMessage = generateLoginMessage(address, nonce);

        setMessage(newMessage);
      } catch (err) {
        toast.error('Error connecting to server');
      }
    };

    if (address) void generateNewMessage(address);
  }, [address]);

  const handleSignSuccess = async (signature): Promise<void> => {
    try {
      if (!address) throw new Error();

      // Verify signature with server
      await requestApiAuth({ identityEthAddress: address, signature });
      onClose();
    } catch (err) {
      toast.error('Login failed');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(): void => onClose()}
      className="fixed inset-0 z-50 overflow-y-auto"
      initialFocus={contentRef}
    >
      <div className="flex items-center justify-center min-h-screen bg-black/30">
        <Box className="p-10" variant="basic" ref={contentRef}>
          <div className="flex justify-end">
            <Button variant="round" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} size="1x" />
            </Button>
          </div>
          <div className="w-full mt-6">
            <div className="flex flex-col w-full">
              <div className="relative p-6 py-6 m-auto space-y-8 border-none rounded-none shadow-none bg-none w-96 dark:bg-slate-900">
                <div className="absolute top-0 left-0 right-0 flex justify-center">
                  <FontAwesomeIcon
                    icon={faSignIn}
                    size="1x"
                    className="text-2xl font-bold"
                  />
                </div>
                <div className="flex justify-center w-full">
                  <div>
                    <div className="text-xl font-semibold text-center">
                      Sign In
                    </div>
                    <div className="text-center">
                      To sign in to Praise, first connect a wallet and then sign
                      a verification message.
                    </div>
                  </div>
                </div>

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
                      <div className="px-4 py-2 font-bold text-white rounded-md bg-themecolor-3 hover:bg-themecolor-4 ${disabledModifier}">
                        <ConnectButton
                          showBalance={false}
                          accountStatus="address"
                        />
                      </div>
                    )}
                  </div>
                )}

                {address && (
                  <div className="flex items-center justify-center w-full">
                    {message ? (
                      <SignMessageButton
                        text="Sign in"
                        message={message}
                        onSignSuccess={(signature): void =>
                          void handleSignSuccess(signature)
                        }
                        onSignError={(): void =>
                          void toast.error('Login denied')
                        }
                      />
                    ) : (
                      <LoaderSpinner />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Box>
      </div>
    </Dialog>
  );
};
