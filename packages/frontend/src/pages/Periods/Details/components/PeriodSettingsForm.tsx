import SettingsForm from '@/components/settings/SettingsForm';
import {
  AllPeriodSettings,
  useSetPeriodSetting,
  useAllPeriodSettingsQuery,
} from '@/model/periodsettings';
import { useRecoilValue } from 'recoil';

interface Params {
  periodId: string;
  disabled: boolean;
}
const PeriodSettingsForm = ({
  periodId,
  disabled,
}: Params): JSX.Element | null => {
  useAllPeriodSettingsQuery(periodId);

  const settings = useRecoilValue(AllPeriodSettings(periodId));
  const { setSetting } = useSetPeriodSetting(periodId);

  return (
    <div className="px-5">
      <SettingsForm
        settings={settings}
        setSetting={setSetting}
        disabled={disabled}
      />
    </div>
  );
};

export default PeriodSettingsForm;
