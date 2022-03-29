import SettingsForm from '@/components/settings/SettingsForm';
import {
  AllPeriodSettings,
  useSetPeriodSetting,
  useAllPeriodSettingsQuery,
} from '@/model/settings';
import { SinglePeriod } from '@/model/periods';
import { PeriodStatusType } from 'api/dist/period/types';
import { useRecoilValue } from 'recoil';

interface Params {
  periodId: string;
}
const PeriodSettingsForm = ({ periodId }: Params): JSX.Element | null => {
  useAllPeriodSettingsQuery(periodId);
  const settings = useRecoilValue(AllPeriodSettings(periodId));
  const { setSetting } = useSetPeriodSetting(periodId);
  const period = useRecoilValue(SinglePeriod(periodId));
  if (!period) return null;

  return (
    <SettingsForm
      settings={settings}
      setSetting={setSetting}
      disabled={period.status !== PeriodStatusType.OPEN}
    />
  );
};

export default PeriodSettingsForm;
