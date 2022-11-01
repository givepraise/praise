import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { UserDto } from 'api/dist/user/types';
import {
  faArrowDownWideShort,
  faHandHoldingHeart,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LoaderSpinner } from '@/components/ui/LoaderSpinner';
import { AllPraiseList, TotalPraiseNumber } from '@/model/praise';
import { Praise } from '@/components/praise/Praise';
import { PraiseRow } from '@/components/praise/PraiseRow';
import { PraisePageLoader } from '@/components/praise/PraisePageLoader';
import { SelectInput } from '@/components/form/SelectInput';

const sortOptions = [
  { value: 'createdAt', label: 'Latest' },
  { value: 'scoreRealized', label: 'Top' },
];

interface sortOptionsProps {
  value: string;
  label: string;
}

const getUseAccountId = (user: UserDto | undefined): string | undefined => {
  const accounts = user?.accounts;
  return Array.isArray(accounts) && accounts.length > 0
    ? accounts[0]._id
    : undefined;
};

export type userAccountTypeNumber = 1 | 2;

interface Props {
  userAccountType: userAccountTypeNumber;
  user: UserDto;
}

export const ReceivedGivenPraiseTable = ({
  userAccountType,
  user,
}: Props): JSX.Element | null => {
  const [selectedSort, setSelectedSort] = useState<sortOptionsProps>(
    sortOptions[0]
  );

  let PRAISE_LIST_KEY =
    userAccountType === 1
      ? selectedSort.value === 'createdAt'
        ? 'RECEIVED_PRAISE_LATEST'
        : 'RECEIVED_PRAISE_TOP'
      : selectedSort.value === 'createdAt'
      ? 'GIVEN_PRAISE_LATEST'
      : 'GIVEN_PRAISE_TOP';

  PRAISE_LIST_KEY = `${PRAISE_LIST_KEY}_${user.username}`;

  const allPraise = useRecoilValue(AllPraiseList(PRAISE_LIST_KEY));
  const userAccountId = getUseAccountId(user);
  const praiseCount = useRecoilValue(TotalPraiseNumber);

  const [page, setPage] = useState<number>(1);

  const queryParams = {
    page,
    sortColumn: selectedSort.value,
    receiver: userAccountType === 1 ? userAccountId : undefined,
    giver: userAccountType === 2 ? userAccountId : undefined,
  };

  if (!userAccountId)
    return (
      <div className="p-5">
        No user account is linked to current Ethereum address. Activate your
        account to see {userAccountType === 1 ? 'received' : 'given'} praise.
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
    <>
      <div className="flex w-full">
        <div className="mt-2 ml-8">
          <FontAwesomeIcon
            icon={faHandHoldingHeart}
            className="mr-2"
            size="1x"
          />
          Number of praise {userAccountType === 1 ? 'received' : 'given'}:{' '}
          <strong>{praiseCount}</strong>
        </div>

        {/* Sort */}
        <div className="w-24 ml-auto mr-5 bg-warm-gray-50">
          <SelectInput
            handleChange={(e): void => {
              setSelectedSort(e);
              setPage(1);
            }}
            selected={selectedSort}
            options={sortOptions}
            icon={faArrowDownWideShort}
          />
        </div>
      </div>

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
        <PraisePageLoader listKey={PRAISE_LIST_KEY} queryParams={queryParams} />
      </React.Suspense>
    </>
  );
};