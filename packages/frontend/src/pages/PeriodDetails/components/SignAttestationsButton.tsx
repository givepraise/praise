import { useRecoilValue } from 'recoil';
import { Button } from '../../../components/ui/Button';
import { ActiveUserId } from '../../../model/auth/auth';
import { SignAttestationsButtonContent } from './SignAttestationsButtonContent';
import { SignSafeTransactionStateType } from '../../../model/safe/types/sign-safe-transaction-state.type';

type SignAttestationsButtonProps = {
  signState?: SignSafeTransactionStateType;
  onClick?: () => void;
};

export function SignAttestationsButton({
  signState,
  onClick,
}: SignAttestationsButtonProps): JSX.Element | null {
  // Global state
  const userId = useRecoilValue(ActiveUserId);

  const signButtonDisabled =
    !userId || signState?.state === 'signing' || signState?.state === 'signed';

  return (
    <Button
      type="button"
      className="py-0 ml-2"
      onClick={onClick}
      disabled={signButtonDisabled}
    >
      <SignAttestationsButtonContent signState={signState} />
    </Button>
  );
}
