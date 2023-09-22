import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Parser } from '@json2csv/plainjs';

import { Dialog } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReceipt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/Button';
import { useSafe } from '../../../model/safe/hooks/useSafe';
import {
  PeriodPageParams,
  useUpdatePeriod,
} from '../../../model/periods/periods';
import { useReportRunReturn } from '../../../model/report/types/use-report-run-return.type';
import { ATTESTATION_REPORT_MANIFEST_URL } from '../../../model/eas/eas.constants';
import { GenerateAttestationsData } from './GenerateAttestationsData';
import { useEas } from '../../../model/eas/hooks/useEas';
import { Attestation } from '../../../model/eas/types/attestation.type';
import { CreateAttestationsDialogSubmitButton } from './CreateAttestationsDialogSubmitButton';

type CreateAttestationsDialogProps = {
  onClose(): void;
};

export function CreateAttestationsDialog({
  onClose,
}: CreateAttestationsDialogProps): JSX.Element | null {
  // Hooks
  const { periodId } = useParams<PeriodPageParams>();
  const { owners, threshold } = useSafe();

  const { createAttestationsTransaction, safeTransactionState } = useEas();

  const { updatePeriod } = useUpdatePeriod();

  // Local state
  const [attestationReportData, setAttestationReportData] =
    useState<useReportRunReturn>();
  const [attestationCsv, setAttestationCsv] = useState<string>();

  // Effects
  function saveTransactionHash(): void {
    if (
      !safeTransactionState?.txHash ||
      safeTransactionState?.status !== 'created'
    )
      return;
    void updatePeriod(periodId, {
      attestationsTxHash: safeTransactionState.txHash,
    });
    onClose();
  }

  function createAttestationCsv(): void {
    if (!attestationReportData) return;
    const csvObjects: Attestation[] = [];
    for (const attestation of attestationReportData.rows) {
      csvObjects.push({
        period: periodId,
        username: attestation.users_username,
        received_score: attestation.total_received_praise_score,
        given_score: attestation.total_given_praise_score,
        top_10_receiver: attestation.top_10_receiver,
        top_50_receiver: attestation.top_50_receiver,
        top_100_receiver: attestation.top_100_receiver,
        top_10_giver: attestation.top_10_giver,
        top_50_giver: attestation.top_50_giver,
        top_100_giver: attestation.top_100_giver,
        recipient: attestation.users_identityEthAddress,
      });
    }
    const parser = new Parser();
    const csv = parser.parse(csvObjects);
    setAttestationCsv(csv);
  }

  useEffect(saveTransactionHash, [
    safeTransactionState?.txHash,
    safeTransactionState?.status,
    updatePeriod,
    periodId,
    onClose,
  ]);
  useEffect(createAttestationCsv, [attestationReportData, periodId]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="relative w-[550px] pb-16 mx-auto bg-white rounded dark:bg-slate-600 dark:text-white">
        <div className="flex justify-end p-6">
          <Button variant={'round'} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </Button>
        </div>
        <div className="px-20">
          <div className="flex justify-center mb-7">
            <FontAwesomeIcon icon={faReceipt} size="2x" />
          </div>

          <Dialog.Title className="text-center mb-7">
            Create Attestations
          </Dialog.Title>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col justify-center gap-5 p-10 text-center border border-black">
              <GenerateAttestationsData
                periodId={periodId}
                manifestUrl={ATTESTATION_REPORT_MANIFEST_URL}
                done={(result): void => {
                  if (!result) return;
                  setAttestationReportData(result);
                }}
              />
            </div>

            {attestationReportData && (
              <>
                <div className="text-center">
                  This transaction requires the signature of:
                  <br />
                  <strong>{threshold}</strong> out of{' '}
                  <strong>{owners.length} owners</strong>.
                </div>
                <div className="p-10 text-center bg-opacity-20 bg-themecolor-alt-2">
                  Submit to create and sign this transaction.
                </div>
              </>
            )}
            <div className="flex justify-center gap-5 mt-5">
              <Button
                onClick={onClose}
                disabled={safeTransactionState?.status === 'creating'}
              >
                Cancel
              </Button>

              <CreateAttestationsDialogSubmitButton
                attestationCsv={attestationCsv}
                createAttestationsTransaction={createAttestationsTransaction}
                safeTransactionState={safeTransactionState}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
