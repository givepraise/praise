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
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SignAttestationsButton } from './SignAttestationsButton';
import { ExecuteAttestationsButton } from './ExecuteAttestationsButton';

export function AttestationsDetailBox(): JSX.Element | null {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  const { SAFE_ADDRESS, isCurrentUserOwner } = useSafe();
  const {
    transaction,
    moreConfirmationsRequired,
    mySignatureAwaited,
    signTransaction,
    signState,
    executeTransaction,
    executeState,
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

  if (
    !period ||
    !period?.attestationsTxHash ||
    !transaction ||
    !SAFE_ADDRESS ||
    typeof moreConfirmationsRequired === 'undefined' ||
    typeof mySignatureAwaited === 'undefined'
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <ul className="pl-0 leading-10">
        <LineListItem variant="check">
          <strong>Attestation data generated</strong>
        </LineListItem>

        <LineListItem variant="dot" size="small">
          <div className="flex flex-col p-2 leading-7 bg-opacity-50 bg-warm-gray-200">
            <Link to={reportUrl}>Attestation data report</Link>
          </div>
        </LineListItem>

        <LineListItem variant="check">
          <strong>Transaction proposed</strong>
        </LineListItem>

        <LineListItem variant="dot" size="small">
          <div className="flex flex-col p-2 leading-7 bg-opacity-50 bg-warm-gray-200">
            <div className="flex items-center">
              Safe transaction hash:{' '}
              <a
                href={`https://app.safe.global/transactions/tx?id=multisig_${SAFE_ADDRESS}_${period?.attestationsTxHash}&safe=oeth:${SAFE_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="ml-1"
              >
                {shortenEthAddress(period?.attestationsTxHash || '')}
              </a>
              <CopyButton textToCopy={period?.attestationsTxHash || ''} />
            </div>
          </div>
        </LineListItem>

        <LineListItem variant={moreConfirmationsRequired ? 'minus' : 'check'}>
          <strong>
            Transaction confirmations ({transaction?.confirmations?.length} of{' '}
            {transaction?.confirmationsRequired})
          </strong>
        </LineListItem>

        <LineListItem variant="dot" size="small">
          <div className="flex flex-col p-2 leading-7 bg-opacity-50 bg-warm-gray-200">
            {transaction?.confirmations?.map((c) => (
              <div key={c.owner} className="flex items-center">
                <UserAvatarAndName identityEthAddress={c.owner} />{' '}
                <FontAwesomeIcon icon={faCheckCircle} className="w-4 ml-1" />
              </div>
            ))}
          </div>
        </LineListItem>

        {mySignatureAwaited && moreConfirmationsRequired && (
          <LineListItem variant="dot" size="small" liClassName="pt-2">
            <div className="flex items-center p-2 leading-5 bg-opacity-50 bg-warm-gray-200">
              Transaction is awaiting your signature
              <SignAttestationsButton
                onClick={signTransaction}
                signState={signState}
              />
            </div>
          </LineListItem>
        )}

        {moreConfirmationsRequired && (
          <LineListItem variant="minus">
            Transaction can be executed once the threshold is reached
          </LineListItem>
        )}

        {!moreConfirmationsRequired && !transaction?.isExecuted && (
          <>
            <LineListItem variant="minus">
              <strong>Transaction is ready to be executed</strong>
            </LineListItem>

            <LineListItem variant="dot" size="small">
              {isCurrentUserOwner && (
                <div className="flex items-center p-2 leading-5 bg-opacity-50 bg-warm-gray-200">
                  As a safe owner you can execute the transaction
                  <ExecuteAttestationsButton
                    onClick={executeTransaction}
                    executeState={executeState}
                  />
                </div>
              )}
              {!isCurrentUserOwner &&
                'The transaction can be executed by any owner.'}
            </LineListItem>
          </>
        )}

        {transaction?.isExecuted && (
          <>
            <LineListItem variant="check">
              <strong>Transaction has been executed</strong>
            </LineListItem>

            <LineListItem variant="dot" size="small">
              <div className="flex flex-col p-2 leading-7 bg-opacity-50 bg-warm-gray-200">
                <div className="flex items-center">
                  Transaction:
                  <a
                    href={`https://optimistic.etherscan.io/tx/${transaction.transactionHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1"
                  >
                    {shortenEthAddress(transaction.transactionHash || '')}
                  </a>
                  <CopyButton textToCopy={transaction?.transactionHash || ''} />
                </div>
                <div className="flex items-center">
                  Executor:
                  <UserAvatarAndName
                    identityEthAddress={transaction.executor}
                    avatarClassName="ml-1"
                  />
                  {', '}
                  <a
                    href={`https://optimistic.etherscan.io/address/${transaction.executor}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1"
                  >
                    {shortenEthAddress(transaction.executor || '')}
                  </a>
                  <CopyButton textToCopy={transaction?.executor || ''} />
                </div>
              </div>
            </LineListItem>
          </>
        )}
      </ul>
    </div>
  );
}
