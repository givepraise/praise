import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSetRecoilState } from 'recoil';
import { useHistory } from 'react-router-dom';
import { ActiveTokenSet } from '@/model/auth';
import { Button } from '@/components/ui/Button';

interface NotFoundProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const ErrorPage = ({ error }: NotFoundProps): JSX.Element => {
  const history = useHistory();
  const setActiveTokenSet = useSetRecoilState(ActiveTokenSet);

  const logout = (): void => {
    setActiveTokenSet(undefined);
    history.replace('/');
  };

  return (
    <div className="flex h-screen">
      <div className="m-auto text-center">
        <FontAwesomeIcon icon={faPrayingHands} size="2x" />
        <br />
        <h2 className="mt-3">{error.response?.statusText}</h2>
        {error.response?.data?.message ? (
          <div className="mt-3">{error.response.data.message}</div>
        ) : error.message ? (
          <div className="mt-3">{error.message}</div>
        ) : null}
        <Button classes="mt-5" onClick={logout}>
          Login
        </Button>
      </div>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default ErrorPage;
