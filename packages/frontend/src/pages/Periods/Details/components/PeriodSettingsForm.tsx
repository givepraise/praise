import React from 'react';
import SettingsForm from '@/components/settings/SettingsForm';
import {
  AllPeriodSettings,
  useSetPeriodSetting,
  useAllPeriodSettingsQuery,
} from '@/model/settings';
import { useRecoilValue } from 'recoil';

interface Params {
  periodId: string;
}
const PeriodSettingsForm = ({ periodId }: Params): JSX.Element => {
  useAllPeriodSettingsQuery(periodId);
  const settings = useRecoilValue(AllPeriodSettings(periodId));
  const { setSetting } = useSetPeriodSetting(periodId);

  return <SettingsForm settings={settings} setSetting={setSetting} />;
};

export default PeriodSettingsForm;
