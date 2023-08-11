import { faHeartCrack } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

const NotFoundPage = (): JSX.Element => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col gap-4 text-2xl text-center">
        <FontAwesomeIcon
          icon={faHeartCrack}
          size="3x"
          className="text-themecolor-3"
        />
        <div className="font-semibold">
          We couldn&apos;t find what you were looking for
        </div>
        <div>
          <Link to="/">Go to start page</Link>
        </div>
      </div>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default NotFoundPage;
