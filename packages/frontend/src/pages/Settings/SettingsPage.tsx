import { faCogs } from '@fortawesome/free-solid-svg-icons';
import { SettingDto, SettingGroup } from 'api/dist/settings/types';
import { AxiosError, AxiosResponse } from 'axios';
import React from 'react';
import { toast } from 'react-hot-toast';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { SettingsForm } from '@/components/settings/SettingsForm';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { PraisePage } from '@/components/ui/PraisePage';
import { isResponseOk } from '@/model/api';
import { AllSettings, useSetSetting } from '@/model/settings';
import { NavItem } from '@/navigation/NavItem';
import { SubPageNav } from '@/navigation/SubPageNav';

const SettingsPage = (): JSX.Element | null => {
  const settings = useRecoilValue(AllSettings);
  const { setSetting } = useSetSetting();
  const { path, url } = useRouteMatch();

  if (!settings) return null;

  const applicationSettings = settings.filter(
    (s) => s.group === SettingGroup.APPLICATION
  );
  const periodDefaultSettings = settings.filter(
    (s) => s.group === SettingGroup.PERIOD_DEFAULT
  );
  const discordSettings = settings.filter(
    (s) => s.group === SettingGroup.DISCORD
  );

  const onSubmit = async (
    setting: SettingDto
  ): Promise<AxiosResponse<SettingDto> | AxiosError | undefined> => {
    const response = await setSetting(setting);
    if (isResponseOk(response)) {
      const setting = response.data;
      toast.success(`Saved setting "${setting.label}"`);
    }
    return response;
  };

  return (
    <PraisePage variant={'wide'}>
      <BreadCrumb name="Settings" icon={faCogs} />

      <div className="flex flex-col space-y-5 xl:space-x-5 xl:flex-row xl:space-y-0">
        <div>
          <SubPageNav>
            <ul>
              <NavItem to={`${url}/application`} description="Application" />
              <NavItem to={`${url}/period`} description="Period Defaults" />
              <NavItem to={`${url}/discord`} description="Discord Bot" />
            </ul>
          </SubPageNav>
        </div>

        <div className="praise-box">
          <Switch>
            <Route path={`${path}/application`}>
              <React.Suspense fallback={null}>
                <SettingsForm
                  settings={applicationSettings}
                  parentOnSubmit={onSubmit}
                />
              </React.Suspense>
            </Route>
            <Route path={`${path}/period`}>
              <React.Suspense fallback={null}>
                <SettingsForm
                  settings={periodDefaultSettings}
                  parentOnSubmit={onSubmit}
                />
              </React.Suspense>
            </Route>
            <Route path={`${path}/discord`}>
              <React.Suspense fallback={null}>
                <SettingsForm
                  settings={discordSettings}
                  parentOnSubmit={onSubmit}
                />
              </React.Suspense>
            </Route>
            <Route path={`${path}`}>
              <Redirect to={`${url}/application`} />
            </Route>
          </Switch>
        </div>
      </div>
    </PraisePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default SettingsPage;
