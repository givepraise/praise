import { useAllPeriodsQuery } from '@/model/periods';
import { useAllSettingsQuery } from '@/model/settings';
import { useAllUsersQuery } from '@/model/users';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactElement } from 'react';
import { useHistory } from 'react-router-dom';

export const StartupLoader: React.FC = (): ReactElement | null => {
  const { location } = useHistory();
  useAllPeriodsQuery(location.key);
  useAllSettingsQuery();
  useAllUsersQuery();
  return null;
};

export const LoadScreen: React.FC = (): ReactElement | null => {
  return (
    <div className="w-full h-screen bg-white opacity-75 flex items-center justify-center">
      <FontAwesomeIcon icon={faPrayingHands} size="5x" spin />
    </div>
  );
};
