import { SettingDto, SettingGroup } from 'api/dist/settings/types';
import { faCogs } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AxiosError, AxiosResponse } from 'axios';
import { AllSettings, useSetSetting } from '@/model/settings';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { SubPageNav } from '@/navigation/SubPageNav';
import { NavItem } from '@/navigation/NavItem';
import { isResponseOk } from '@/model/api';
import { Page } from '@/components/ui/Page';
import { DiscordBotSettings } from './components/DiscordBotSettings';
import { CustomExportSettings } from './components/CustomExportSettings';
import { PeriodDefaultsSettings } from './components/PeriodDefaultsSettings';
import { ApplicationSettings } from './components/ApplicationSettings';

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
  const customExportSettings = settings.filter(
    (s) => s.group === SettingGroup.CUSTOM_EXPORT
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
    <Page variant={'wide'}>
      <BreadCrumb name="Settings" icon={faCogs} />

      <div className="flex flex-col space-y-5 xl:space-x-5 xl:flex-row xl:space-y-0">
        <div>
          <SubPageNav>
            <ul>
              <NavItem
                to={`${url}/application`}
                description="Application"
                replace
                rounded
              />
              <NavItem
                to={`${url}/period`}
                description="Period Defaults"
                replace
              />
              <NavItem
                to={`${url}/discord`}
                description="Discord Bot"
                replace
              />
              <NavItem
                to={`${url}/custom-export`}
                description="Custom Export"
                replace
                rounded
              />
            </ul>
          </SubPageNav>
        </div>
        <div>
          <Switch>
            <Route path={`${path}/application`}>
              <React.Suspense fallback={null}>
                <ApplicationSettings
                  settings={applicationSettings}
                  parentOnSubmit={onSubmit}
                />
              </React.Suspense>
            </Route>
            <Route path={`${path}/period`}>
              <React.Suspense fallback={null}>
                <PeriodDefaultsSettings
                  settings={periodDefaultSettings}
                  parentOnSubmit={onSubmit}
                />
              </React.Suspense>
            </Route>
            <Route path={`${path}/discord`}>
              <React.Suspense fallback={null}>
                <DiscordBotSettings
                  settings={discordSettings}
                  parentOnSubmit={onSubmit}
                />
              </React.Suspense>
            </Route>
            <Route path={`${path}/custom-export`}>
              <React.Suspense fallback={null}>
                <CustomExportSettings
                  settings={customExportSettings}
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
    </Page>
  );
};

// eslint-disable-next-line import/no-default-export
export default SettingsPage;
