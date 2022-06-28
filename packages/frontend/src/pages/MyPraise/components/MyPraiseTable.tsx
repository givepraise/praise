import React, { useEffect, useState } from 'react';
import LoaderSpinner from '@/components/LoaderSpinner';
import { AllPraiseList } from '@/model/praise';
import { useRecoilValue } from 'recoil';
import PraisePageLoader from '@/components/praise/PraisePageLoader';
import Praise from '@/components/praise/Praise';
import PraiseRow from '@/components/praise/PraiseRow';
import { ActiveUserId } from '@/model/auth';
import { SingleUser } from '@/model/users';
import { UserDto } from 'api/dist/user/types';

export const PRAISE_LIST_KEY = 'MY_PRAISE';

const getReceiverId = (user: UserDto | undefined): string | undefined => {
  const accounts = user?.accounts;
  return Array.isArray(accounts) && accounts.length > 0
    ? accounts[0]._id
    : undefined;
};

const MyPraiseTable = (): JSX.Element => {
  const allPraise = useRecoilValue(AllPraiseList(PRAISE_LIST_KEY));
  const [receiverId, setReceiverId] = useState<string | undefined>(undefined);
  const userId = useRecoilValue(ActiveUserId);
  const user = useRecoilValue(SingleUser(userId));

  useEffect(() => {
    if (!user) return;
    setReceiverId(getReceiverId(user));
  }, [user]);

  return (
    <>
      <ul>
        {allPraise?.map((praise, index) => (
          <PraiseRow praise={praise} key={index}>
            <Praise praise={praise} className="p-3" showReceiver={false} />
          </PraiseRow>
        ))}
      </ul>
      <React.Suspense fallback={<LoaderSpinner />}>
        <PraisePageLoader listKey={PRAISE_LIST_KEY} receiverId={receiverId} />
      </React.Suspense>
    </>
  );
};

export default MyPraiseTable;
