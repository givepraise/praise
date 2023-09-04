import {
  faCheckCircle,
  faExternalLink,
  faPrayingHands,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useReport } from '../../../model/report/hooks/use-report.hook';
import { useReportRunReturn } from '../../../model/report/types/use-report-run-return.type';
import { objectToQs } from '../../../utils/querystring';
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { SinglePeriod } from '../../../model/periods/periods';

type GenerateAttestationsDataProps = {
  periodId: string;
  manifestUrl: string;
  done: (result: useReportRunReturn | undefined) => void;
};

export function GenerateAttestationsData({
  periodId,
  manifestUrl,
  done,
}: GenerateAttestationsDataProps): JSX.Element {
  const period = useRecoilValue(SinglePeriod(periodId));
  const report = useReport({
    manifestUrl,
    periodId,
    startDate: period?.startDate,
    endDate: period?.endDate,
  });
  const [data, setData] = useState<useReportRunReturn | undefined>(undefined);

  useEffect(() => {
    if (!report.ready || data) return;
    const runReport = async (): Promise<void> => {
      const result = await report.run({ format: 'json' });
      setData(result);
      done(result);
    };
    void runReport();
  }, [report, data, done]);

  if (!report.ready)
    return (
      <>
        <FontAwesomeIcon icon={faPrayingHands} spin size="2x" />
        <div>Loading attestation report…</div>
      </>
    );

  if (!data)
    return (
      <>
        <FontAwesomeIcon icon={faPrayingHands} spin size="2x" />
        <div>Running attestation report…</div>
      </>
    );

  const reportUrl = `/reports/run?${objectToQs({
    manifestUrl,
    startDate: period?.startDate || '',
    endDate: period?.endDate || '',
  })}`;

  return (
    <>
      <FontAwesomeIcon icon={faCheckCircle} size="3x" />
      <div>
        Finished generating attestation data.{' '}
        <Link to={reportUrl}>
          <FontAwesomeIcon icon={faExternalLink} />
        </Link>
      </div>
      <div>{data.rows.length} rows returned.</div>
    </>
  );
}
