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

export const ApplicationSettings = ({
  settings,
  parentOnSubmit,
}: Params): JSX.Element | null => {
  if (!settings) return null;

  return (
    <>
      <Box className="mb-6">
        <SettingsSubgroup header="Application Settings">
          <SettingsForm settings={settings} parentOnSubmit={parentOnSubmit} />
        </SettingsSubgroup>
      </Box>
    </>
  );
};
