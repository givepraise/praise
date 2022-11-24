import React from 'react';
import { useRecoilValue } from 'recoil';
import { LoaderSpinner } from '@/components/ui/LoaderSpinner';
import { AllPraiseList } from '@/model/praise';
import { PraisePageLoader } from '@/components/praise/PraisePageLoader';
import { Praise } from '@/components/praise/Praise';
import { PraiseRow } from '@/components/praise/PraiseRow';

export const PRAISE_LIST_KEY = 'ALL_PRAISE';

export const PraiseTable = (): JSX.Element => {
  const allPraise = useRecoilValue(AllPraiseList(PRAISE_LIST_KEY));

  return (
    <div className="pb-4">
      <ul>
        {allPraise?.map((praise, index) => (
          <PraiseRow praise={praise} key={index}>
            <Praise praise={praise} className="p-3" />
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
        <PraisePageLoader listKey={PRAISE_LIST_KEY} />
      </React.Suspense>
    </div>
  );
};
