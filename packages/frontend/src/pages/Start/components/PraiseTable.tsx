import LoaderSpinner from '@/components/LoaderSpinner';
import { AllPraiseList } from '@/model/praise';
import React from 'react';
import { useRecoilValue } from 'recoil';
import PraisePageLoader from '@/components/praise/PraisePageLoader';
import Praise from '@/components/praise/Praise';
import PraiseRow from '@/components/praise/PraiseRow';

export const PRAISE_LIST_KEY = 'ALL_PRAISE';

const PraiseTable = (): JSX.Element => {
  const allPraise = useRecoilValue(AllPraiseList(PRAISE_LIST_KEY));

  return (
    <>
      <ul>
        {allPraise?.map((praise, index) => (
          <PraiseRow praise={praise} key={index}>
            <Praise praise={praise} className="p-3" />
          </PraiseRow>
        ))}
      </ul>
      <React.Suspense fallback={<LoaderSpinner />}>
        <PraisePageLoader />
      </React.Suspense>
    </>
  );
};

export default PraiseTable;
