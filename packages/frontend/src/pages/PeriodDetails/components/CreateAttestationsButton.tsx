import { useRecoilValue } from 'recoil';
import { useAccount } from 'wagmi';
import { Button } from '../../../components/ui/Button';
import { PeriodPageParams, SinglePeriod } from '../../../model/periods/periods';
import { useParams } from 'react-router-dom';
import { CommunityByHostname } from '../../../model/communitites/communities';
import { useSafe } from '../../../model/safe/hooks/useSafe';
import { useEffect, useState } from 'react';

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
  const { safe } = useSafe(community?.creator);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  useEffect(() => {
    if (!safe || !address) return;
    const isOwner = async (): Promise<void> => {
      setIsOwner(await safe.isOwner(address));
    };
    void isOwner();
  }, [safe, address]);

  // Not connected: return null
  // No period: return null
  // Attestations already created: return null
  if (!address || !period || period.attestationsTxHash || !isOwner) {
    return null;
  }

  return (
    <div>
      <Button onClick={onClick}>Create Attestations</Button>
    </div>
  );
}
