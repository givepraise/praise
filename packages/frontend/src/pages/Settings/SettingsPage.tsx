import { SettingGroup } from 'api/dist/settings/types';
import { faCogs } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { AllSettings, useSetSetting } from '@/model/settings';
import { BreadCrumb } from '@/components/BreadCrumb';
import { SubPageNav } from '@/navigation/SubPageNav';
import { NavItem } from '@/navigation/NavItem';
import { SettingsForm } from '@/components/settings/SettingsForm';

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

  return (
    <div className="praise-page-wide">
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
                  setSetting={setSetting}
                />
              </React.Suspense>
            </Route>
            <Route path={`${path}/period`}>
              <React.Suspense fallback={null}>
                <SettingsForm
                  settings={periodDefaultSettings}
                  setSetting={setSetting}
                />
              </React.Suspense>
            </Route>
            <Route path={`${path}/discord`}>
              <React.Suspense fallback={null}>
                <SettingsForm
                  settings={discordSettings}
                  setSetting={setSetting}
                />
              </React.Suspense>
            </Route>
            <Route path={`${path}`}>
              <Redirect to={`${url}/application`} />
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default SettingsPage;
