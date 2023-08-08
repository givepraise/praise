import { useRecoilValue } from 'recoil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faPrayingHands,
} from '@fortawesome/free-solid-svg-icons';
import { ActiveUserId } from '../../../model/auth/auth';
import { ExecuteSafeTransactionStateType } from '../../../model/safe/types/execute-safe-transaction-state.type';

type ExecuteAttestationsButtonContentProps = {
  executeState?: ExecuteSafeTransactionStateType;
};

export function ExecuteAttestationsButtonContent({
  executeState,
}: ExecuteAttestationsButtonContentProps): JSX.Element {
  const userId = useRecoilValue(ActiveUserId);

  if (userId) {
    if (
      typeof executeState === 'undefined' ||
      executeState?.state === 'error'
    ) {
      return <>Execute transaction</>;
    }

    if (executeState?.state === 'executing') {
      return (
        <>
          <FontAwesomeIcon icon={faPrayingHands} spin className="w-4 mr-2" />
          Executing
        </>
      );
    }

    if (executeState?.state === 'indexing') {
      return (
        <>
          <FontAwesomeIcon icon={faPrayingHands} spin className="w-4 mr-2" />
          Indexing
        </>
      );
    }

    if (executeState?.state === 'executed') {
      return (
        <>
          <FontAwesomeIcon icon={faCheckCircle} className="w-4 mr-2" />
          Executed
        </>
      );
    }
  }
  return <>Login to execute</>;
}
