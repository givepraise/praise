import { useSignMessage } from 'wagmi';
import { LoaderSpinner } from '@/components/ui/LoaderSpinner';
import { PraiseButton } from '../ui/PraiseButton';

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
    <LoaderSpinner />
  ) : (
    <PraiseButton onClick={(): void => signMessage()}>{text}</PraiseButton>
  );
};

export { SignMessageButton };
