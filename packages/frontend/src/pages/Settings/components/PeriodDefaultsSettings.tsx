import { PeriodSettingDto } from 'api/dist/periodsettings/types';
import { SettingDto } from 'api/dist/settings/types';
import { AxiosError, AxiosResponse } from 'axios';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { Box } from '@/components/ui/Box';
import { SettingsSection } from './SettingsSection';

interface Params {
  settings: SettingDto[] | undefined;
  parentOnSubmit(
    setting: SettingDto | PeriodSettingDto
  ): Promise<
    | AxiosResponse<SettingDto>
    | AxiosResponse<PeriodSettingDto>
    | AxiosError
    | undefined
  >;
}

export const PeriodDefaultsSettings = ({
  settings,
  parentOnSubmit,
}: Params): JSX.Element | null => {
  if (!settings) return null;

  return (
    <>
      <Box className="mb-6">
        <SettingsSection
          header="Period Defaults"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        >
          <SettingsForm settings={settings} parentOnSubmit={parentOnSubmit} />
        </SettingsSection>
      </Box>
    </>
  );
};
