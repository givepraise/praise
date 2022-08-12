import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const LoadScreen: React.FC = (): JSX.Element => {
  return (
    <div className="flex items-center justify-center w-full h-screen opacity-75">
      <FontAwesomeIcon icon={faPrayingHands} size="5x" spin />
    </div>
  );
};
