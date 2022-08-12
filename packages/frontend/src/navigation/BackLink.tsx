import { Link } from 'react-router-dom';

interface BackLinkProps {
  to: string;
}

export const BackLink = ({ to }: BackLinkProps): JSX.Element => {
  return (
    <div className="hidden mb-2 md:block">
      <Link
        to={to}
        className="mb-2 text-sm no-underline cursor-pointer hover:underline"
      >
        ← Back
      </Link>
    </div>
  );
};
