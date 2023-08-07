import { useRecoilValue } from 'recoil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faPrayingHands,
} from '@fortawesome/free-solid-svg-icons';
import { ActiveUserId } from '../../../model/auth/auth';
import { SignSafeTransactionStateType } from '../../../model/safe/types/sign-safe-transaction-state.type';

type SignAttestationsButtonContentProps = {
  signState?: SignSafeTransactionStateType;
};

export function SignAttestationsButtonContent({
  signState,
}: SignAttestationsButtonContentProps): JSX.Element {
  // Global state
  const userId = useRecoilValue(ActiveUserId);

  if (userId) {
    if (typeof signState === 'undefined') {
      return <>Sign transaction</>;
    }

    if (signState?.state === 'signing') {
      return (
        <>
          <FontAwesomeIcon icon={faPrayingHands} spin className="w-4 mr-2" />
          Signing
        </>
      );
    }

    if (signState?.state === 'signed') {
      return (
        <>
          <FontAwesomeIcon icon={faCheckCircle} className="w-4 mr-2" />
          Signed
        </>
      );
    }
  }
  return <>Login to sign</>;
}
