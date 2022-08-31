import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface ErrorPlaceholderProps {
  height: number;
  error?: Error;
}
export const ErrorPlaceholder = ({
  height,
  error,
}: ErrorPlaceholderProps): JSX.Element => {
  return (
    <div
      className="flex items-center justify-center w-full h-full bg-warm-gray-100 rounded-xl dark:bg-slate-500"
      style={{ height }}
    >
      <FontAwesomeIcon icon={faTriangleExclamation} size="2x" />
      {error && <div>{error.message}</div>}
    </div>
  );
};
