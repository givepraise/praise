import { faTimes, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useReport } from '../../../model/report/hooks/use-report.hook';
import { useParams } from 'react-router-dom';
import { AllPeriods, PeriodPageParams } from '../../../model/periods/periods';
import { useRecoilValue } from 'recoil';
import {
  getPeriodDatesConfig,
  PeriodDates,
} from '../../../model/report/util/get-period-dates-config';
import { ReportManifestDto } from '../../../model/report/dto/report-manifest.dto';
import { useReportRunReturn } from '../../../model/report/types/use-report-run-return.type';
import { set } from 'lodash';
import { AllReports } from '../../../model/report/reports';

type GenerateAttestationsDataProps = {
  periodId: string;
  periodDates: PeriodDates;
  manifestUrl: string;
  done: (result: useReportRunReturn | undefined) => void;
};

// type AttestationsData = {
//   manifest: ReportManifestDto;
//   result: useReportRunReturn | undefined;
// };

// function GenerateAttestationsData({
//   periodId,
//   periodDates,
// }: GenerateAttestationsDataProps): JSX.Element {
//   const [data, setData] = useState<Map<string, useReportRunReturn | undefined>>(
//     new Map<string, useReportRunReturn | undefined>()
//   );
//   const [running, setRunning] = useState<boolean>(false);

//   const report = useReport({
//     manifestUrl:
//       'https://raw.githubusercontent.com/givepraise/reports/main/reports/top-givers/manifest.json',
//     periodId,
//     startDate: periodDates.startDate,
//     endDate: periodDates.endDate,
//   });

//   useEffect(() => {
//     if (!report.ready || running) return;

//     setRunning(true);

//     console.log('running report', report);
//     data.set(report.manifest.name, undefined);
//     setData(data);

//     const runReport = async (): Promise<void> => {
//       const result = await report.run({ format: 'json' });
//       data.set(report.manifest.name, result);
//       setData(data);
//       console.log(result);
//     };
//     void runReport();
//   }, [report, data, running]);

//   return (
//     <div className="flex flex-col items-center justify-center">
//       Genweerating...
//       <pre>
//         {data
//           ? Array.from(
//               data,
//               ([key, value]) => `${key}: ${value?.rows.length}`
//             ).join(', ')
//           : '...'}
//       </pre>
//     </div>
//   );
// }

function GenerateAttestationsData({
  periodId,
  periodDates,
  manifestUrl,
  done,
}: GenerateAttestationsDataProps): JSX.Element {
  const report = useReport({
    manifestUrl,
    periodId,
    startDate: periodDates.startDate,
    endDate: periodDates.endDate,
  });
  const [data, setData] = useState<useReportRunReturn | undefined>(undefined);

  useEffect(() => {
    if (!report.ready || data) return;
    console.log('running report', report);
    const runReport = async (): Promise<void> => {
      const result = await report.run({ format: 'json' });
      setData(result);
      done(result);
    };
    void runReport();
  }, [report, data, done]);

  if (!report.ready) return <div>loading...</div>;

  if (!data) return <div>running...</div>;

  return <div>{data.rows.length}</div>;
}

interface CreateAttestationsDialogProps {
  onClose(): void;
}

export function CreateAttestationsDialog({
  onClose,
}: CreateAttestationsDialogProps): JSX.Element | null {
  const { periodId } = useParams<PeriodPageParams>();
  const periods = useRecoilValue(AllPeriods);
  const [periodDates, setPeriodDates] = useState<PeriodDates | undefined>(
    undefined
  );
  const reports = useRecoilValue(AllReports);

  useEffect(() => {
    if (!periods) return;
    setPeriodDates(getPeriodDatesConfig(periods, periodId));
  }, [periods, periodId]);

  if (!periodDates) return null;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Dialog.Overlay className="fixed inset-0 bg-black/30" />
      <div className="relative max-w-xl pb-16 mx-auto bg-white rounded dark:bg-slate-600 dark:text-white">
        <div className="flex justify-end p-6">
          <Button variant={'round'} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} size="1x" />
          </Button>
        </div>
        <div className="px-20">
          <div className="flex justify-center mb-7">
            <FontAwesomeIcon icon={faUsers} size="2x" />
          </div>
          <Dialog.Title className="text-center mb-7">
            Create Attestations
            <div className="flex flex-col items-center justify-center">
              Generating...
              <pre>
                {reports?.map((report) => (
                  <GenerateAttestationsData
                    key={report.name}
                    periodId={periodId}
                    periodDates={periodDates}
                    manifestUrl={report.manifestUrl || ''}
                    done={(result): void => {
                      console.log('done', result);
                    }}
                  />
                ))}
              </pre>
            </div>
          </Dialog.Title>
          <React.Suspense fallback={null}>content</React.Suspense>
        </div>
      </div>
    </div>
  );
}
