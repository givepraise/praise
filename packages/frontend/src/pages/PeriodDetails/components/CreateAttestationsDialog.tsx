import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { Dialog } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPrayingHands,
  faReceipt,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/Button';
import { useSafe } from '../../../model/safe/hooks/useSafe';
import { useAttestations } from '../../../model/eas/hooks/useAttestations';
import {
  getPeriodDatesConfig,
  PeriodDates,
} from '../../../model/report/util/get-period-dates-config';
import {
  AllPeriods,
  PeriodPageParams,
  useUpdatePeriod,
} from '../../../model/periods/periods';
import { CommunityByHostname } from '../../../model/communitites/communities';
import { useReportRunReturn } from '../../../model/report/types/use-report-run-return.type';
import { ATTESTATION_REPORT_MANIFEST_URL } from '../../../model/eas/eas.constants';
import { GenerateAttestationsData } from './GenerateAttestationsData';

type CreateAttestationsDialogProps = {
  onClose(): void;
};

export function CreateAttestationsDialog({
  onClose,
}: CreateAttestationsDialogProps): JSX.Element | null {
  const { periodId } = useParams<PeriodPageParams>();
  const periods = useRecoilValue(AllPeriods);
  const [periodDates, setPeriodDates] = useState<PeriodDates | undefined>(
    undefined
  );
  const community = useRecoilValue(
    CommunityByHostname(window.location.hostname)
  );
  const { safe } = useSafe(community?.creator);
  const [owners, setOwners] = useState<string[] | undefined[]>([]);
  const [treshold, setTreshold] = useState<number>(0);
  const [attestationData, setAttestationData] = useState<
    useReportRunReturn | undefined
  >(undefined);
  const { createAttestations, creating, txHash } = useAttestations({
    hostname: window.location.hostname,
  });

  function loadPeriodDates(): void {
    if (!periods) return;
    setPeriodDates(getPeriodDatesConfig(periods, periodId));
  }

  function loadSignersAndThreshold(): void {
    if (!safe) return;
    const loadSigners = async (): Promise<void> => {
      const owners = await safe.getOwners();
      const treshold = await safe.getThreshold();
      setOwners(owners);
      setTreshold(treshold);
    };
    void loadSigners();
  }

  const { updatePeriod } = useUpdatePeriod();
  function saveTransactionHash(): void {
    if (!txHash) return;
    void updatePeriod(periodId, { attestationsTxHash: txHash });
    onClose();
  }

  useEffect(loadPeriodDates, [periods, periodId]);
  useEffect(loadSignersAndThreshold, [safe]);
  useEffect(saveTransactionHash, [txHash, periodId, updatePeriod, onClose]);

  if (!periodDates) return null;

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
                periodDates={periodDates}
                manifestUrl={ATTESTATION_REPORT_MANIFEST_URL}
                done={(result): void => {
                  if (!result) return;
                  setAttestationData(result);
                }}
              />
            </div>

            {attestationData && (
              <>
                <div className="text-center">
                  This transaction requires the signature of:
                  <br />
                  <strong>{treshold}</strong> out of{' '}
                  <strong>{owners.length} owners</strong>.
                </div>
                <div className="p-10 text-center bg-opacity-20 bg-themecolor-alt-2">
                  Submit to create and sign this transaction.
                </div>
              </>
            )}
            <div className="flex justify-center gap-5 mt-5">
              <Button onClick={onClose} disabled={creating}>
                Cancel
              </Button>
              <Button
                onClick={(): void => {
                  if (!attestationData) return;
                  void createAttestations(attestationData, periodId);
                }}
                disabled={!attestationData || creating}
              >
                {creating ? (
                  <>
                    <FontAwesomeIcon
                      icon={faPrayingHands}
                      className="w-4 mr-2"
                      spin
                    />
                    Creating...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
