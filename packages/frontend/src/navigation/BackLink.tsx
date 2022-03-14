import { Link } from 'react-router-dom';

interface BackLinkProps {
  to: string;
}
const BackLink = ({ to }: BackLinkProps): JSX.Element => {
  return (
    <div className="mb-2">
      <Link
        to={to}
        className="mb-2 text-sm cursor-pointer no-underline hover:underline"
      >
        ← Back
      </Link>
    </div>
  );
};

export default BackLink;
