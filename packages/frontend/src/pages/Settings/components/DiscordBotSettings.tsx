import { AxiosError, AxiosResponse } from 'axios';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { Box } from '@/components/ui/Box';
import { SettingsSubgroup } from './SettingsSubgroup';
import { SettingDto } from '@/model/settings/dto/setting.dto';

interface Params {
  settings: SettingDto[] | undefined;
  parentOnSubmit(
    setting: SettingDto
  ): Promise<AxiosResponse<SettingDto> | AxiosError | undefined>;
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
          description="Control how the Discord Bot interacts with community members. For more details on these settings, please refer to the documentation: <a href='https://givepraise.xyz/docs/configuring/discord-bot'>Docs – Discord Bot</a>"
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
          description="Adapt the default Praise messages to match your community's style. For more details on these settings, please refer to the documentation: <a href='https://givepraise.xyz/docs/configuring/discord-bot'>Docs – Discord Bot</a>"
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
          description="Adapt the default Praise messages to match your community's style. For more details on these settings, please refer to the documentation: <a href='https://givepraise.xyz/docs/configuring/discord-bot'>Docs – Discord Bot</a>"
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
