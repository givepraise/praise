import BreadCrumb from '@/components/BreadCrumb';
import { faCogs } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import 'react-day-picker/lib/style.css';
import SettingsForm from './components/SettingsForm';

const SettingsPage = (): JSX.Element => {
  return (
    <div className="max-w-2xl mx-auto">
      <BreadCrumb name="Settings" icon={faCogs} />

      <div className="w-full praise-box">
        <h2 className="mb-2">Settings</h2>
        <React.Suspense fallback="Loading…">
          <SettingsForm />
        </React.Suspense>
      </div>
    </div>
  );
};

export default SettingsPage;
