import { Button } from '../../../components/ui/Button';
import { useSwitchNetwork } from 'wagmi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandsPraying, faShuffle } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export function SwitchNetworkButton(): JSX.Element {
  const { switchNetwork, isLoading, isError, error } = useSwitchNetwork();

  useEffect(() => {
    if (isError) {
      console.error(error);
      const message = error?.message || 'Unknown error';
      toast.error(message);
    }
  }, [isError, error]);

  if (!switchNetwork) {
    return (
      <Button type="button" disabled className="inline-block">
        <FontAwesomeIcon icon={faHandsPraying} spin className="w-4 mr-1" />
        Initializing
      </Button>
    );
  }

  return (
    <Button
      type="button"
      onClick={(): void => switchNetwork(10)}
      disabled={isLoading}
      className="inline-block"
    >
      {isLoading ? (
        <FontAwesomeIcon icon={faHandsPraying} spin className="w-4 mr-1" />
      ) : (
        <FontAwesomeIcon icon={faShuffle} className="w-4 mr-1" />
      )}
      Switch Network
    </Button>
  );
}
