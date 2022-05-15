import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

interface Props {
  disabled?: boolean;
  onClick();
}

const MarkDuplicateButton = ({
  disabled = false,
  onClick,
}: Props): JSX.Element => {
  return (
    <button
      disabled={disabled}
      className={
        disabled
          ? 'praise-button-disabled space-x-2 bg-blue-200 text-white'
          : 'praise-button space-x-2 bg-blue-500 hover:bg-blue-600 text-white'
      }
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faCopy} size="1x" />
      <span>Mark as duplicates</span>
    </button>
  );
};

export default MarkDuplicateButton;
