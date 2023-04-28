import React from 'react';
import { useRecoilValue } from 'recoil';
import { LoaderSpinner } from '@/components/ui/LoaderSpinner';
import { AllPraiseList } from '@/model/praise/praise';
import { Praise } from '@/components/praise/Praise';
import { PraiseRow } from '@/components/praise/PraiseRow';
import { ActiveUserId } from '@/model/auth/auth';
import { SingleUser } from '@/model/user/users';
import { PraisePageLoader } from '@/components/praise/PraisePageLoader';
import { User } from '@/model/user/dto/user.dto';

const PRAISE_LIST_KEY = 'MY_PRAISE';

const getReceiverId = (user: User | undefined): string | undefined => {
  const accounts = user?.accounts;
  return Array.isArray(accounts) && accounts.length > 0
    ? accounts[0]._id
    : undefined;
};

export const MyPraiseTable = (): JSX.Element | null => {
  const allPraise = useRecoilValue(AllPraiseList(PRAISE_LIST_KEY));
  const userId = useRecoilValue(ActiveUserId);
  const user = useRecoilValue(SingleUser(userId));
  const receiverId = getReceiverId(user);

  if (!receiverId)
    return (
      <div className="p-5">
        No user account is linked to current Ethereum address. Activate your
        account to see received praise.
        <br />
        <br />
        <a
          href="https://givepraise.xyz/docs/using-praise"
          target="_blank"
          rel="noreferrer"
        >
          Learn more about how to use Praise
        </a>
      </div>
    );

  return (
    <div className="pb-6 @container">
      <ul>
        {allPraise?.map((praise, index) => (
          <PraiseRow praise={praise} key={index}>
            <Praise praise={praise} className="p-3" showReceiver={false} />
          </PraiseRow>
        ))}
      </ul>
      <React.Suspense
        fallback={
          <div className="p-20">
            <LoaderSpinner />
          </div>
        }
      >
        <PraisePageLoader
          listKey={PRAISE_LIST_KEY}
          queryParams={{ receiver: receiverId }}
        />
      </React.Suspense>
    </div>
  );
};
