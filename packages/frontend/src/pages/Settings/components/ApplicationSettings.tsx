import { AxiosError, AxiosResponse } from 'axios';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { Box } from '@/components/ui/Box';
import { SettingsSubgroup } from './SettingsSubgroup';
import ApplicationSettingsApiKeys from './ApplicationSettingsApiKeys';
import { Setting as SettingDto } from '@/model/settings/dto/setting.dto';
import { useRecoilValue } from 'recoil';
import { CurrentCommunity } from '../../../model/community/community';

interface Params {
  settings: SettingDto[] | undefined;
  parentOnSubmit(
    setting: SettingDto
  ): Promise<AxiosResponse<SettingDto> | AxiosError | undefined>;
}

export const ApplicationSettings = ({
  settings,
  parentOnSubmit,
}: Params): JSX.Element | null => {
  const community = useRecoilValue(CurrentCommunity);
  if (!settings) return null;
  return (
    <>
      <Box className="mb-6">
        <SettingsSubgroup header="Application Settings">
          <>
            <div className="flex flex-col gap-4 mb-4">
              <div>
                <label className="block font-bold group">Creator address</label>
                <div>{community?.creator}</div>
              </div>
              <div>
                <label className="block font-bold group">Owner addresses</label>
                <div>
                  {community?.owners.map((owner) => (
                    <div key={owner}>{owner}</div>
                  ))}
                </div>
              </div>
            </div>
            <SettingsForm settings={settings} parentOnSubmit={parentOnSubmit} />
          </>
        </SettingsSubgroup>
      </Box>
      <Box className="mb-6">
        <SettingsSubgroup header="Api Keys">
          <ApplicationSettingsApiKeys />
        </SettingsSubgroup>
      </Box>
    </>
  );
};
