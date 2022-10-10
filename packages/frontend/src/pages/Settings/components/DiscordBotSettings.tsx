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

export const DiscordBotSettings = ({
  settings,
  parentOnSubmit,
}: Params): JSX.Element | null => {
  if (!settings) return null;

  const botBehaviourSettings = settings.filter((s) => s.section === 1);

  const authenticationMessagesSettings = settings.filter(
    (s) => s.section === 2
  );

  const praiseMessagesSettings = settings.filter((s) => s.section === 3);

  return (
    <>
      <Box className="mb-6">
        <SettingsSection
          header="Bot Behaviour"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        >
          <SettingsForm
            settings={botBehaviourSettings}
            parentOnSubmit={parentOnSubmit}
          />
        </SettingsSection>
      </Box>
      <Box className="mb-6">
        <SettingsSection
          header="Authentication Messages"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        >
          <SettingsForm
            settings={authenticationMessagesSettings}
            parentOnSubmit={parentOnSubmit}
          />
        </SettingsSection>
      </Box>
      <Box>
        <SettingsSection
          header="Praise Messages"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        >
          <SettingsForm
            settings={praiseMessagesSettings}
            parentOnSubmit={parentOnSubmit}
          />
        </SettingsSection>
      </Box>
    </>
  );
};
