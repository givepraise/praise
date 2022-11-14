import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { LoaderSpinner } from '@/components/ui/LoaderSpinner';
import { AllPraiseList, AllPraiseQueryPagination } from '@/model/praise';
import { PraisePageLoader } from '@/components/praise/PraisePageLoader';
import { Praise } from '@/components/praise/Praise';
import { PraiseRow } from '@/components/praise/PraiseRow';
import { PraiseBackNextLink } from '@/components/praise/PraiseBackNextLink';

export const PRAISE_LIST_KEY = 'ALL_PRAISE';

export const PraiseTable = (): JSX.Element => {
  const allPraise = useRecoilValue(AllPraiseList(PRAISE_LIST_KEY));
  const [page, setPage] = useState<number>(1);
  const praisePagination = useRecoilValue(
    AllPraiseQueryPagination(PRAISE_LIST_KEY)
  );

  const divRef = React.useRef<null | HTMLDivElement>(null);

  const handlePageChange = (page: number): void => {
    setPage(page);
    if (divRef && divRef.current) {
      divRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div ref={divRef}>
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
        <PraisePageLoader listKey={PRAISE_LIST_KEY} queryParams={{ page }} />
      </React.Suspense>

      {allPraise && (
        <div className="mb-5">
          <PraiseBackNextLink
            praisePagination={praisePagination}
            onClick={(page): void => handlePageChange(page)}
          />
        </div>
      )}
    </div>
  );
};
