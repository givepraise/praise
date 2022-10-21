import { faMedal, faUser } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRecoilValue } from 'recoil';
import { useParams } from 'react-router-dom';
import { BreadCrumb } from '@/components/ui/BreadCrumb';
import { Page } from '@/components/ui/Page';
import { Box } from '@/components/ui/Box';
import { Button } from '@/components/ui/Button';
import {
  SingleUser,
  SingleUserParams,
  useLoadSingleUserDetails,
} from '@/model/users';
import { ActiveUserId } from '@/model/auth';
import { UserInfo } from './components/UserInfo';
import {
  userAccountTypeNumber,
  ReceivedGivenPraiseTable,
} from './components/ReceivedGivenPraiseTable';

const UserDetailsPage = (): JSX.Element | null => {
  const { userId } = useParams<SingleUserParams>();
  const activeUserId = useRecoilValue(ActiveUserId);

  const isProfilePage = userId === activeUserId;

  const detailsResponse = useLoadSingleUserDetails(userId);
  const user = useRecoilValue(SingleUser(userId));
  console.log('USER:', user);

  const pageViews = {
    receivedPraiseView: 1,
    givenPraiseView: 2,
  };

  const [view, setView] = useState<number>(pageViews.receivedPraiseView);

  if (!user || !detailsResponse) return null;

  return (
    <Page>
      <BreadCrumb name="Profile" icon={faUser} />

      <UserInfo user={user} isProfilePage={isProfilePage} />

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
            user={user}
          />
        </React.Suspense>
      </Box>
    </Page>
  );
};

export default UserDetailsPage;
