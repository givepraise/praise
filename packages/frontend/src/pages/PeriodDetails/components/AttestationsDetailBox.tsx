import { Link, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { PeriodPageParams, SinglePeriod } from '../../../model/periods/periods';
import { ETH_CHAIN_ID } from '../../../model/eth/eth.constants';
import { useNetwork } from 'wagmi';
import { shortenEthAddress } from '../../../utils/string';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink } from '@fortawesome/free-solid-svg-icons';
import { useSafe } from '../../../model/safe/hooks/useSafe';
import { CommunityByHostname } from '../../../model/communitites/communities';
import { useEffect, useState } from 'react';
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types';

export function AttestationsDetailBox(): JSX.Element {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  const community = useRecoilValue(
    CommunityByHostname(window.location.hostname)
  );
  const SAFE_ADDRESS = community?.creator;

  const { chain } = useNetwork();
  const { safeApiKit } = useSafe(SAFE_ADDRESS);

  const [safeMultisigTransactionResponse, setSafeMultisigTransactionResponse] =
    useState<SafeMultisigTransactionResponse | undefined>(undefined);

  function loadTransaction(): void {
    if (!safeApiKit || !period?.attestationsTxHash) return;
    const loadTransaction = async (): Promise<void> =>
      setSafeMultisigTransactionResponse(
        await safeApiKit.getTransaction(period.attestationsTxHash)
      );
    void loadTransaction();
  }

  useEffect(loadTransaction, [safeApiKit, period]);

  return (
    <div className="flex flex-col gap-5">
      <div>Attestation data generated</div>
      <div>Transaction created</div>
      <div>Link to report</div>
      <div>Transaction hash</div>
      <div>
        <a
          href={`https://optimistic.etherscan.io/tx/${period?.attestationsTxHash}`}
          target="_blank"
          rel="noreferrer"
        >
          {shortenEthAddress(period?.attestationsTxHash || '')}
          <FontAwesomeIcon icon={faExternalLink} className="w-4 ml-1" />
        </a>
      </div>
      <div>
        {safeMultisigTransactionResponse?.confirmations?.map((c) => (
          <div key={c.owner}>{c.owner}</div>
        ))}
      </div>
    </div>
  );
}
