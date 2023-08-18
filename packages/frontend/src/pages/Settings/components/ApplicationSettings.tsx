import { AxiosError, AxiosResponse } from 'axios';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { Box } from '@/components/ui/Box';
import { SettingsSubgroup } from './SettingsSubgroup';
import ApplicationSettingsApiKeys from './ApplicationSettingsApiKeys';
import { Setting as SettingDto } from '@/model/settings/dto/setting.dto';
import { useRecoilValue } from 'recoil';
import { CurrentCommunity } from '../../../model/community/community';
import { Jazzicon } from '@ukstv/jazzicon-react';

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
                <div className="mb-2 text-sm text-warm-gray-400">
                  The creator address is the address that represents this
                  community onchain. To be able to create attestations or
                  distribute tokens from this address, it should be a{' '}
                  <a
                    href="https://safe.global"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Safe
                  </a>{' '}
                  address.
                </div>
                <div>
                  <Jazzicon
                    address={community?.creator || ''}
                    className="inline-block w-4"
                  />{' '}
                  {community?.creator}
                </div>
              </div>
              <div>
                <label className="block font-bold group">Owner addresses</label>
                <div className="mb-2 text-sm text-warm-gray-400">
                  The owner addresses represent the identities that will allways
                  have adin permissions in this Praise community.
                </div>
                <div>
                  {community?.owners.map((owner) => (
                    <div key={owner}>
                      <Jazzicon address={owner} className="inline-block w-4" />{' '}
                      {owner}
                    </div>
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
