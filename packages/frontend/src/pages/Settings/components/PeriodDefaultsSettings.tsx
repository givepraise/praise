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

export const PeriodDefaultsSettings = ({
  settings,
  parentOnSubmit,
}: Params): JSX.Element | null => {
  if (!settings) return null;

  return (
    <>
      <Box className="mb-6">
        <SettingsSubgroup
          header="Period Defaults"
          description="The period defaults are used as template when creating new periods. Changing these settings will not affect existing periods. Read more about quantifiers in the documentation: <a href='https://givepraise.xyz/docs/configuring/period-defaults' target='_blank'>Docs – Period Defaults</a>"
        >
          <SettingsForm settings={settings} parentOnSubmit={parentOnSubmit} />
        </SettingsSubgroup>
      </Box>
    </>
  );
};
