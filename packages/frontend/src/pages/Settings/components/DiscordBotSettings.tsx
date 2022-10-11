import { PeriodSettingDto } from 'api/dist/periodsettings/types';
import { SettingDto } from 'api/dist/settings/types';
import { AxiosError, AxiosResponse } from 'axios';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { Box } from '@/components/ui/Box';
import { SettingsSubgroup } from './SettingsSubgroup';

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

export const DiscordBotSettings = ({
  settings,
  parentOnSubmit,
}: Params): JSX.Element | null => {
  if (!settings) return null;

  const botBehaviourSettings = settings.filter((s) => s.subgroup === 1);

  const authenticationMessagesSettings = settings.filter(
    (s) => s.subgroup === 2
  );

  const praiseMessagesSettings = settings.filter((s) => s.subgroup === 3);

  return (
    <>
      <Box className="mb-6">
        <SettingsSubgroup
          header="Bot Behaviour"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        >
          <SettingsForm
            settings={botBehaviourSettings}
            parentOnSubmit={parentOnSubmit}
          />
        </SettingsSubgroup>
      </Box>
      <Box className="mb-6">
        <SettingsSubgroup
          header="Authentication Messages"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        >
          <SettingsForm
            settings={authenticationMessagesSettings}
            parentOnSubmit={parentOnSubmit}
          />
        </SettingsSubgroup>
      </Box>
      <Box>
        <SettingsSubgroup
          header="Praise Messages"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        >
          <SettingsForm
            settings={praiseMessagesSettings}
            parentOnSubmit={parentOnSubmit}
          />
        </SettingsSubgroup>
      </Box>
    </>
  );
};
