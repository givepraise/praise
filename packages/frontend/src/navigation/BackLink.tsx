import { useHistory } from 'react-router-dom';

interface BackLinkProps {
  to: string;
}
const BackLink = ({ to }: BackLinkProps): JSX.Element => {
  const history = useHistory();

  return (
    <div
      onClick={(): void => {
        history.push(to);
      }}
      className="mb-2 text-sm cursor-pointer"
    >
      ← Back
    </div>
  );
};

export default BackLink;
