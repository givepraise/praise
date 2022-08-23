import { useHistory } from 'react-router-dom';

export const BackLink = (): JSX.Element => {
  const history = useHistory();
  return (
    <div className="hidden mb-2 md:block">
      <div
        className="mb-2 text-sm no-underline cursor-pointer hover:underline"
        onClick={(): void => {
          history.goBack();
        }}
      >
        ← Back
      </div>
    </div>
  );
};
