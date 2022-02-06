import { useHistory } from 'react-router-dom';

const BackLink = () => {
  const history = useHistory();

  return (
    <div
      onClick={() => {
        history.goBack();
      }}
      className="mb-2 text-sm cursor-pointer"
    >
      ← Back
    </div>
  );
};

export default BackLink;
