import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const LoaderSpinner = (): JSX.Element => {
  return (
    <div className="w-full text-center">
      <FontAwesomeIcon
        icon={faSpinner}
        size="1x"
        spin
        className="inline-block"
      />
    </div>
  );
};
