import { Link, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { PeriodPageParams, SinglePeriod } from '../../../model/periods/periods';
import { shortenEthAddress } from '../../../utils/string';
import { LineListItem } from '../../../components/ui/LineListItem';
import { UserAvatarAndName } from '../../../components/user/UserAvatarAndName';
import { CopyButton } from './CopyButton';
import { useSafeTransaction } from '../../../model/safe/hooks/useSafeTransaction';
import { ATTESTATION_REPORT_MANIFEST_URL } from '../../../model/eas/eas.constants';
import { objectToQs } from '../../../utils/querystring';
import { useSafe } from '../../../model/safe/hooks/useSafe';
import {
  faCheckCircle,
  faExternalLink,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SignAttestationsButton } from './SignAttestationsButton';

export function AttestationsDetailBox(): JSX.Element | null {
  // Hooks
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  const { SAFE_ADDRESS } = useSafe();
  const {
    transaction,
    moreConfirmationsRequired,
    mySignatureAwaited,
    signTransaction,
    signState,
  } = useSafeTransaction({
    safeTxHash: period?.attestationsTxHash,
  });

  const reportUrl = period
    ? `/reports/run?${objectToQs({
        manifestUrl: ATTESTATION_REPORT_MANIFEST_URL,
        startDate: period.startDate,
        endDate: period.endDate,
      })}`
    : '';

  if (!period?.attestationsTxHash) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <ul className="pl-0 leading-10">
        <LineListItem variant="check">
          <strong>Attestation data generated</strong>
        </LineListItem>

        <LineListItem variant="dot" size="small">
          <Link to={reportUrl}>Attestation data report</Link>
        </LineListItem>

        <LineListItem variant="check">
          <strong>Safe transaction created</strong>
        </LineListItem>

        <LineListItem variant="dot" size="small">
          <a
            href={`https://app.safe.global/transactions/queue?safe=oeth:${SAFE_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
          >
            Transaction queue{' '}
            <FontAwesomeIcon icon={faExternalLink} className="w-4" />
          </a>
        </LineListItem>

        <LineListItem variant="dot" size="small">
          Transaction hash:{' '}
          {shortenEthAddress(period?.attestationsTxHash || '')}{' '}
          <CopyButton textToCopy={period?.attestationsTxHash || ''} />
        </LineListItem>

        <LineListItem variant="check">
          <strong>
            Transaction confirmations ({transaction?.confirmations?.length} of
            {transaction?.confirmationsRequired})
          </strong>
        </LineListItem>

        {transaction?.confirmations?.map((c) => (
          <LineListItem variant="dot" size="small" key={c.owner}>
            <UserAvatarAndName identityEthAddress={c.owner} />{' '}
            <FontAwesomeIcon icon={faCheckCircle} className="w-4 ml-1" />
          </LineListItem>
        ))}

        {mySignatureAwaited && (
          <LineListItem
            variant="dot"
            size="small"
            liClassName="bg-warm-gray-300 leading-5"
          >
            Transaction is awaiting your signature
            <SignAttestationsButton
              onClick={signTransaction}
              signState={signState}
            />
          </LineListItem>
        )}

        {moreConfirmationsRequired && (
          <LineListItem variant="minus">
            Transaction can be executed once the threshold is reached
          </LineListItem>
        )}
      </ul>
    </div>
  );
}
