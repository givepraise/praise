import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

const NotFoundPage = (): JSX.Element => {
  return (
    <div className="w-2/3 text-center praise-box">
      <Link to="/">
        <FontAwesomeIcon icon={faPrayingHands} size="2x" />
      </Link>
      <br />
      <h2 className="mt-3">404</h2>
      <div className="mt-3">Page not found.</div>
    </div>
  );
};

export default NotFoundPage;
