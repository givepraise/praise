import { useRecoilValue } from 'recoil';
import { useAccount } from 'wagmi';
import { Button } from '../../../components/ui/Button';
import { PeriodPageParams, SinglePeriod } from '../../../model/periods/periods';
import { useParams } from 'react-router-dom';
import { useSafe } from '../../../model/safe/hooks/useSafe';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { ActiveUserId } from '../../../model/auth/auth';
import { UserAvatarAndName } from '../../../components/user/UserAvatarAndName';

type CreateAttestationsButtonProps = {
  onClick: () => void;
};

export function CreateAttestationsButton({
  onClick,
}: CreateAttestationsButtonProps): JSX.Element | null {
  // Hooks
  const { periodId } = useParams<PeriodPageParams>();
  const { address } = useAccount();
  const { safe, safeError } = useSafe();

  // Global state
  const period = useRecoilValue(SinglePeriod(periodId));
  const userId = useRecoilValue(ActiveUserId);

  // Local state
  const [isOwner, setIsOwner] = useState<boolean>();
  const [owners, setOwners] = useState<string[]>();
  useEffect(() => {
    if (!safe || !address) return;
    const isOwner = async (): Promise<void> => {
      setIsOwner(await safe.isOwner(address));
      setOwners(await safe.getOwners());
    };
    void isOwner();
  }, [safe, address]);

  if (!period || period.attestationsTxHash) {
    return null;
  }

  const disabled = !userId || !address;

  if (safeError) {
    return (
      <div>
        <div>
          <strong>Error:</strong> {safeError.message}
        </div>
        <div>
          Make sure the community creator address is valid Safe account address.
        </div>
      </div>
    );
  }

  if (address && typeof isOwner === 'undefined') {
    return (
      <div>
        <Button disabled>
          <FontAwesomeIcon icon={faPrayingHands} spin className="w-4 mr-2" />
          Loading Safe
        </Button>
      </div>
    );
  }

  if (isOwner) {
    return (
      <div>
        <Button onClick={onClick} disabled={disabled}>
          <FontAwesomeIcon icon={faPlus} className="w-4 mr-2" />
          Create Attestations
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      Only Safe owners can create attestations.
      <div>
        Owners:
        {owners?.map((owner) => (
          <div key={owner}>
            <UserAvatarAndName identityEthAddress={owner} />
          </div>
        ))}
      </div>
    </div>
  );
}
