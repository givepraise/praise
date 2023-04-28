import { AxiosError, AxiosResponse } from 'axios';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { Box } from '@/components/ui/Box';
import { SettingsSubgroup } from './SettingsSubgroup';
import { Setting } from '@/model/settings/dto/setting.dto';

interface Params {
  settings: Setting[] | undefined;
  parentOnSubmit(
    setting: Setting
  ): Promise<AxiosResponse<Setting> | AxiosError | undefined>;
}

export const RewardsSettings = ({
  settings,
  parentOnSubmit,
}: Params): JSX.Element | null => {
  if (!settings) return null;

  return (
    <>
      <Box className="mb-6">
        <SettingsSubgroup
          header="Rewards Settings"
          description="Praise rewards distributions are run by the same reporting engine as all other reports. To add a custom rewards distribution, see instructions on GitHub: <a href='https://github.com/givepraise/reports' target='_blank'>Praise – Reports</a>"
        >
          <SettingsForm settings={settings} parentOnSubmit={parentOnSubmit} />
        </SettingsSubgroup>
      </Box>
    </>
  );
};
