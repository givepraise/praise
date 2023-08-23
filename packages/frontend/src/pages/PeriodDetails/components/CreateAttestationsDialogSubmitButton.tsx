import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SafeTransactionState } from '../../../model/eas/types/eas-context-value.type';
import { Button } from '../../../components/ui/Button';

const buttonStates = {
  creating: {
    icon: faPrayingHands,
    text: 'Creating...',
  },
  signing: {
    icon: faPrayingHands,
    text: 'Signing...',
  },
  created: {
    text: 'Created',
  },
  error: {
    text: 'Submit',
  },
  default: {
    text: 'Submit',
  },
};

type CreateAttestationsDialogSubmitButtonProps = {
  safeTransactionState?: SafeTransactionState;
  attestationCsv?: string;
  createAttestationsTransaction?: (attestationCsv: string) => Promise<void>;
};

export function CreateAttestationsDialogSubmitButton({
  safeTransactionState,
  attestationCsv,
  createAttestationsTransaction,
}: CreateAttestationsDialogSubmitButtonProps): JSX.Element {
  const currentButtonState = safeTransactionState?.status
    ? buttonStates[safeTransactionState?.status]
    : buttonStates.default;

  const isButtonDisabled = safeTransactionState?.status
    ? ['creating', 'created', 'signing'].includes(safeTransactionState?.status)
    : false;

  return (
    <Button
      onClick={() => {
        if (!attestationCsv || !createAttestationsTransaction) return;
        void createAttestationsTransaction(attestationCsv);
      }}
      disabled={isButtonDisabled}
    >
      {currentButtonState?.icon && (
        <FontAwesomeIcon
          icon={currentButtonState.icon}
          className="w-4 mr-2"
          spin
        />
      )}
      {currentButtonState.text}
    </Button>
  );
}
