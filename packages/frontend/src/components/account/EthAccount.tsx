import { shortenEthAddress } from 'api/dist/user/utils/core';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { useAccount } from 'wagmi';
import { faAngleDown, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { classNames } from '@/utils/index';
import { EthAccountDialog } from './EthAccountDialog';

interface EthAccountParams {
  className?: string;
  showDownCaret?: boolean;
  showRightCaret?: boolean;
}

export const EthAccount = ({
  className,
  showDownCaret = true,
  showRightCaret = false,
}: EthAccountParams): JSX.Element | null => {
  const { address } = useAccount();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  if (!address) return null;

  return (
    <>
      <div
        className={classNames(
          'flex justify-between items-center cursor-pointer',
          className
        )}
        onClick={(): void => setIsDialogOpen(true)}
      >
        <div className="flex items-center space-x-2">
          <div className="inline-block h-5">
            <Jazzicon address={address} className="w-4 h-4" />
          </div>
          <span>{shortenEthAddress(address)}</span>
        </div>
        <div>
          {showDownCaret && (
            <FontAwesomeIcon icon={faAngleDown} className="w-4 h-4" />
          )}
          {showRightCaret && (
            <FontAwesomeIcon icon={faAngleRight} className="w-4 h-4" />
          )}
        </div>
      </div>
      <EthAccountDialog
        open={isDialogOpen}
        address={address}
        onClose={(): void => setIsDialogOpen(false)}
      />
    </>
  );
};
