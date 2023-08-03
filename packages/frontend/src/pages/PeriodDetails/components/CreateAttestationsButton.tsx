import { useRecoilValue } from 'recoil';
import { useAccount } from 'wagmi';
import { Button } from '../../../components/ui/Button';
import { PeriodPageParams, SinglePeriod } from '../../../model/periods/periods';
import { useParams } from 'react-router-dom';
import { CommunityByHostname } from '../../../model/communitites/communities';
import { useSafe } from '../../../model/safe/hooks/useSafe';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { ActiveUserId } from '../../../model/auth/auth';

type CreateAttestationsButtonProps = {
  onClick: () => void;
};

export function CreateAttestationsButton({
  onClick,
}: CreateAttestationsButtonProps): JSX.Element | null {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  const community = useRecoilValue(
    CommunityByHostname(window.location.hostname)
  );
  const { address } = useAccount();
  const userId = useRecoilValue(ActiveUserId);
  const { safe } = useSafe(community?.creator);
  const [isOwner, setIsOwner] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (!safe || !address) return;
    const isOwner = async (): Promise<void> => {
      setIsOwner(await safe.isOwner(address));
    };
    void isOwner();
  }, [safe, address]);

  if (!address || !userId || !period || period.attestationsTxHash) {
    return null;
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
        <Button onClick={onClick}>Create Attestations</Button>
      </div>
    );
  }

  return <div>Only Safe owners can create attestations.</div>;
}
