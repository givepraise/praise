import { useRecoilValue } from 'recoil';
import { Button } from '../../../components/ui/Button';
import { ActiveUserId } from '../../../model/auth/auth';
import { ExecuteAttestationsButtonContent } from './ExecuteAttestationsButtonContent';
import { ExecuteSafeTransactionStateType } from '../../../model/safe/types/execute-safe-transaction-state.type';

type ExecuteAttestationsButtonProps = {
  executeState?: ExecuteSafeTransactionStateType;
  onClick?: () => void;
};

export function ExecuteAttestationsButton({
  executeState,
  onClick,
}: ExecuteAttestationsButtonProps): JSX.Element | null {
  const userId = useRecoilValue(ActiveUserId);

  const signButtonDisabled =
    !userId ||
    executeState?.state === 'executing' ||
    executeState?.state === 'indexing' ||
    executeState?.state === 'executed';

  return (
    <Button
      type="button"
      className="py-0 ml-2"
      onClick={onClick}
      disabled={signButtonDisabled}
    >
      <ExecuteAttestationsButtonContent executeState={executeState} />
    </Button>
  );
}
