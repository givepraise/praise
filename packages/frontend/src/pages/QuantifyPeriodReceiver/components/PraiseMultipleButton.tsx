import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';

interface Props {
  disabled?: boolean;
  onClick();
}

const PraiseMultipleButton = ({
  disabled = false,
  onClick,
}: Props): JSX.Element => {
  return (
    <button
      disabled={disabled}
      className={
        disabled
          ? 'praise-button-disabled space-x-2'
          : 'praise-button space-x-2'
      }
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faPrayingHands} size="1x" />
      <span>Praise</span>
    </button>
  );
};

export default PraiseMultipleButton;
