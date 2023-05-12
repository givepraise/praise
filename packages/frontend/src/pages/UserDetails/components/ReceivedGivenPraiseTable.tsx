import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  faArrowDownWideShort,
  faHandHoldingHeart,
  faPrayingHands,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LoaderSpinner } from '@/components/ui/LoaderSpinner';
import {
  AllPraiseList,
  praiseSortOptions,
  PraiseTableSelectedSortOption,
} from '@/model/praise/praise';
import { Praise } from '@/components/praise/Praise';
import { PraiseRow } from '@/components/praise/PraiseRow';
import { PraisePageLoader } from '@/components/praise/PraisePageLoader';
import { SelectInput } from '@/components/form/SelectInput';
import { UserWithStatsDto } from '@/model/user/dto/user-with-stats.dto';

const getUseAccountId = (
  user: UserWithStatsDto | undefined
): string | undefined => {
  const accounts = user?.accounts;
  return Array.isArray(accounts) && accounts.length > 0
    ? accounts[0]._id
    : undefined;
};

export type userAccountTypeNumber = 1 | 2;

interface Props {
  userAccountType: userAccountTypeNumber;
  user: UserWithStatsDto;
}

export const ReceivedGivenPraiseTable = ({
  userAccountType,
  user,
}: Props): JSX.Element | null => {
  const [selectedSort, setSelectedSort] = useRecoilState(
    PraiseTableSelectedSortOption
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

  const [page, setPage] = useState<number>(1);

  const queryParams = {
    page,
    sortColumn: selectedSort.value,
    receiver: userAccountType === 1 ? userAccountId : undefined,
    giver: userAccountType === 2 ? userAccountId : undefined,
  };

  useEffect(() => {
    setPage(1);
  }, [userAccountType]);

  if (!userAccountId)
    return (
      <div className="p-5">
        No praise {userAccountType === 1 ? 'received' : 'given'}.
      </div>
    );

  return (
    <>
      <div className="w-full sm:flex">
        <div className="ml-4 sm:ml-8">
          <FontAwesomeIcon
            icon={userAccountType === 1 ? faPrayingHands : faHandHoldingHeart}
            className="mr-2"
            size="1x"
          />
          Number of praise {userAccountType === 1 ? 'received' : 'given'}:{' '}
          <strong>
            {userAccountType === 1
              ? user.receivedTotalCount
              : user.givenTotalCount}
          </strong>
        </div>

        {/* Sort */}
        <div className="mt-4 ml-4 mr-5 sm:w-24 sm:mt-0 sm:ml-auto">
          <SelectInput
            handleChange={(e): void => {
              setSelectedSort(e);
              setPage(1);
            }}
            selected={selectedSort}
            options={praiseSortOptions}
            icon={faArrowDownWideShort}
          />
        </div>
      </div>
      <ul>
        {allPraise?.map((praise, index) => (
          <PraiseRow praise={praise} key={index}>
            <Praise
              praise={praise}
              className="p-3"
              showReceiver={userAccountType !== 1}
            />
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
          queryParams={queryParams}
          onLoadMoreClick={(page): void => setPage(page)}
        />
      </React.Suspense>
    </>
  );
};
