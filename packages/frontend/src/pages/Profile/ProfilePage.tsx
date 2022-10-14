import {
  faArrowDownWideShort,
  faMedal,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRecoilValue } from 'recoil';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { Page } from '@/components/ui/Page';
import { Box } from '@/components/ui/Box';
import { Button } from '@/components/ui/Button';
import { SingleUser } from '@/model/users';
import { ActiveUserId } from '@/model/auth';
import { UserInfo } from './components/UserInfo';
import {
  userAccountTypeNumber,
  ReceivedGivenPraiseTable,
} from './components/ReceivedGivenPraiseTable';

export const ProfilePage = (): JSX.Element | null => {
  const userId = useRecoilValue(ActiveUserId);
  const user = useRecoilValue(SingleUser(userId));

  const pageViews = {
    receivedPraiseView: 1,
    givenPraiseView: 2,
  };

  const [view, setView] = useState<number>(pageViews.receivedPraiseView);

  if (!user) return null;

  return (
    <Page>
      <BreadCrumb name="Profile" icon={faUser} />

      <UserInfo user={user} />

      <div className="flex mt-5 mb-5">
        <Button
          variant={'outline'}
          className={`rounded-r-none  ${
            view === pageViews.givenPraiseView
              ? 'bg-opacity-50 text-opacity-50 hover:border-themecolor-4'
              : 'hover:bg-themecolor-3 hover:border-themecolor-3'
          }`}
          onClick={(): void => setView(pageViews.receivedPraiseView)}
        >
          <FontAwesomeIcon icon={faUser} size="1x" className="mr-2" />
          Received praise
        </Button>
        <Button
          variant={'outline'}
          className={`rounded-l-none  ${
            view === pageViews.receivedPraiseView
              ? 'bg-opacity-50  text-opacity-50 hover:border-themecolor-4 '
              : 'hover:bg-themecolor-3 hover:border-themecolor-3'
          }`}
          onClick={(): void => setView(pageViews.givenPraiseView)}
        >
          <FontAwesomeIcon icon={faMedal} size="1x" className="mr-2" />
          Given praise
        </Button>
      </div>

      <Box className="px-0">
        <React.Suspense fallback={null}>
          <ReceivedGivenPraiseTable
            userAccountType={view as userAccountTypeNumber}
          />
        </React.Suspense>
      </Box>
    </Page>
  );
};
