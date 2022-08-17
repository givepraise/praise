import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface ErrorPlaceholderProps {
  height: number;
}
export const ErrorPlaceholder = ({
  height,
}: ErrorPlaceholderProps): JSX.Element => {
  return (
    <div
      className="flex items-center justify-center w-full bg-warm-gray-100 rounded-xl"
      style={{ height }}
    >
      <FontAwesomeIcon icon={faTriangleExclamation} size="2x" />
    </div>
  );
};
