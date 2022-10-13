import { faMedal, faUser } from '@fortawesome/free-solid-svg-icons';
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

export const ProfilePage = (): JSX.Element | null => {
  const userId = useRecoilValue(ActiveUserId);
  const user = useRecoilValue(SingleUser(userId));

  const pageViews = {
    allPraiseView: 1,
    topPraiseView: 2,
  };

  const [view, setView] = useState<number>(pageViews.allPraiseView);

  if (!user) return null;

  console.log('USER:', user);

  return (
    <Page>
      <BreadCrumb name="Profile" icon={faUser} />

      <UserInfo user={user} />

      <div className="mt-5 mb-5">
        <Button
          variant={'outline'}
          className={`rounded-r-none  ${
            view === pageViews.topPraiseView
              ? 'bg-opacity-50 text-opacity-50 hover:border-themecolor-4'
              : 'hover:bg-themecolor-3 hover:border-themecolor-3'
          }`}
          onClick={(): void => setView(pageViews.allPraiseView)}
        >
          <FontAwesomeIcon icon={faUser} size="1x" className="mr-2" />
          All Praise
        </Button>
        <Button
          variant={'outline'}
          className={`rounded-l-none  ${
            view === pageViews.allPraiseView
              ? 'bg-opacity-50  text-opacity-50 hover:border-themecolor-4 '
              : 'hover:bg-themecolor-3 hover:border-themecolor-3'
          }`}
          onClick={(): void => setView(pageViews.topPraiseView)}
        >
          <FontAwesomeIcon icon={faMedal} size="1x" className="mr-2" />
          Top Praise
        </Button>
      </div>

      <Box className="px-0">
        <div className="px-5 mb-2 text-right"></div>
        <React.Suspense fallback={null}>Table here</React.Suspense>
      </Box>
    </Page>
  );
};
