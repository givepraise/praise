import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const LoadScreen: React.FC = (): JSX.Element => {
  return (
    <div className="w-full h-screen bg-white opacity-75 flex items-center justify-center">
      <FontAwesomeIcon icon={faPrayingHands} size="5x" spin />
    </div>
  );
};
