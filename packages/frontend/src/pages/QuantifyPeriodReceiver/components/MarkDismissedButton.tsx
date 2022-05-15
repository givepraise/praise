import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';

interface Props {
  disabled?: boolean;
  onClick();
}

const MarkDismissedButton = ({
  disabled = false,
  onClick,
}: Props): JSX.Element => {
  return (
    <button
      disabled={disabled}
      className={
        disabled
          ? 'praise-button-disabled space-x-2 bg-red-200 text-white'
          : 'praise-button space-x-2 bg-red-500 hover:bg-red-600 text-white'
      }
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faMinusCircle} size="1x" />
      <span>Dismiss</span>
    </button>
  );
};

export default MarkDismissedButton;
