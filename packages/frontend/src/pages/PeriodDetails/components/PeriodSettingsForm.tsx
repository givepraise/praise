import { useRecoilRefresher_UNSTABLE, useRecoilValue } from 'recoil';
import { PeriodSettingDto } from 'api/dist/periodsettings/types';
import { toast } from 'react-hot-toast';
import { AxiosError, AxiosResponse } from 'axios';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { AllPeriodSettings, useSetPeriodSetting } from '@/model/periodsettings';
import { isResponseOk } from '@/model/api';
import { PeriodPoolRequirementsQuery } from '@/model/periods/periods';

interface Params {
  periodId: string;
  disabled: boolean;
}

const PeriodSettingsForm = ({
  periodId,
  disabled,
}: Params): JSX.Element | null => {
  const settings = useRecoilValue(AllPeriodSettings(periodId));
  const refreshPoolRequirements = useRecoilRefresher_UNSTABLE(
    PeriodPoolRequirementsQuery(periodId)
  );

  const { setSetting } = useSetPeriodSetting(periodId);

  const onSubmit = async (
    setting: PeriodSettingDto
  ): Promise<AxiosResponse<PeriodSettingDto> | AxiosError | undefined> => {
    try {
      const response = await setSetting(setting);
      if (isResponseOk(response)) {
        // Reload quantify pool requirements
        refreshPoolRequirements();
        const setting = response.data;
        toast.success(`Saved setting "${setting.label}"`);
      }
      return response;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="px-5">
      <SettingsForm
        settings={settings}
        parentOnSubmit={onSubmit}
        disabled={disabled}
      />
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default PeriodSettingsForm;
