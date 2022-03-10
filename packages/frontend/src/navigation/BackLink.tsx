import { useHistory } from 'react-router-dom';

const BackLink = (): JSX.Element => {
  const history = useHistory();

  return (
    <div
      onClick={(): void => {
        history.goBack();
      }}
      className="mb-2 text-sm cursor-pointer"
    >
      ← Back
    </div>
  );
};

export default BackLink;
