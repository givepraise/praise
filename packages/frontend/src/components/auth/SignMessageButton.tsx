import { useSignMessage } from 'wagmi';
import { Button } from '../ui/Button';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  text: string;
  message: string;
  onSignSuccess(signature: string): void;
  onSignError(): void;
}

const SignMessageButton = ({
  text,
  message,
  onSignSuccess,
  onSignError,
}: Props): JSX.Element | null => {
  const { isLoading, isSuccess, signMessage } = useSignMessage({
    message,
    onError() {
      onSignError();
    },
    onSuccess(data) {
      onSignSuccess(data);
    },
  });

  return isLoading || isSuccess ? (
    <Button disabled>
      <FontAwesomeIcon icon={faPrayingHands} spin className="w-4 mr-2" />
      Signing in...
    </Button>
  ) : (
    <Button onClick={(): void => signMessage()}>{text}</Button>
  );
};

export { SignMessageButton };
