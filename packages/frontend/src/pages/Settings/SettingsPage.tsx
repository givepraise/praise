import BreadCrumb from '@/components/BreadCrumb';
import { faCogs } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import SettingsForm from '../../components/settings/SettingsForm';
import { AllSettings, useSetSetting } from '@/model/settings';
import { useRecoilValue } from 'recoil';

const SettingsPage = (): JSX.Element => {
  const settings = useRecoilValue(AllSettings);
  const { setSetting } = useSetSetting();

  return (
    <div className="max-w-2xl mx-auto">
      <BreadCrumb name="Settings" icon={faCogs} />

      <div className="w-full praise-box">
        <h2 className="mb-2">Settings</h2>
        <React.Suspense fallback="Loading…">
          <SettingsForm settings={settings} setSetting={setSetting} />
        </React.Suspense>
      </div>
    </div>
  );
};

export default SettingsPage;
