import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const LoaderSpinner = (): JSX.Element => {
  return (
    <div className="w-full text-center">
      <FontAwesomeIcon
        icon={faPrayingHands}
        size="1x"
        spin
        className="inline-block"
      />
    </div>
  );
};
