import { useAllPeriodsQuery } from '@/model/periods';
import { useAllUsersQuery } from '@/model/users';
import { faPrayingHands } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactElement } from 'react';
import { useHistory } from 'react-router-dom';
import { useAllSettingsQuery } from './model/settings';

export const StartupLoader: React.FC = (): ReactElement | null => {
  const { location } = useHistory();
  useAllPeriodsQuery(location.key);
  useAllSettingsQuery();
  useAllUsersQuery();
  return null;
};

export const LoadScreen: React.FC = (): ReactElement | null => {
  return (
    <div className="fixed top-0 left-0 z-50 block w-full h-full bg-white opacity-75">
      <span
        className="relative block w-0 h-0 mx-auto my-0 top-1/2"
        style={{ top: '50%' }}
      >
        <FontAwesomeIcon icon={faPrayingHands} size="5x" spin />
      </span>
    </div>
  );
};
