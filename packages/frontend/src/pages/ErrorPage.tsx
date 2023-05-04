import { faHeartCrack } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/components/ui/Button';
import { useDisconnect } from 'wagmi';
import { useSetRecoilState } from 'recoil';
import { ActiveTokenSet } from '../model/auth/auth';

interface NotFoundProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
}

const ErrorPage = ({ error }: NotFoundProps): JSX.Element => {
  const { disconnect } = useDisconnect();
  const setActiveTokenSet = useSetRecoilState(ActiveTokenSet);

  const handleStartoverButtonClick = (): void => {
    disconnect();
    setActiveTokenSet(undefined);
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen">
      <div className="m-auto text-center">
        <FontAwesomeIcon icon={faHeartCrack} size="2x" />
        <h2 className="mt-3 text-xl font-semibold">
          Something is broken
          {error.response?.statusText}
        </h2>
        {error.response?.data?.message ? (
          <div className="mt-3">{error.response.data.message}</div>
        ) : error.message ? (
          <div className="mt-3">{error.message}</div>
        ) : null}
        <Button className="mt-5" onClick={handleStartoverButtonClick}>
          Start over
        </Button>
      </div>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default ErrorPage;
