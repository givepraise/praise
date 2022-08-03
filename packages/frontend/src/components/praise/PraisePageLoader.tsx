import React, { useCallback, useEffect, useState } from 'react';
import { BottomScrollListener } from 'react-bottom-scroll-listener';
import { useRecoilValue } from 'recoil';

import { LoaderSpinner } from '@/components/ui/LoaderSpinner';
import { AllPraiseQueryPagination, useAllPraise } from '@/model/praise';

interface Params {
  listKey: string;
  receiverId?: string;
}

export const PraisePageLoader = ({
  listKey,
  receiverId,
}: Params): JSX.Element => {
  const praisePagination = useRecoilValue(AllPraiseQueryPagination(listKey));
  const [nextPageNumber, setNextPageNumber] = useState<number>(
    praisePagination.currentPage + 1
  );
  const receiverIdQuery = receiverId ? { receiver: receiverId } : {};
  const queryResponse = useAllPraise(
    {
      page: nextPageNumber,
      limit: 20,
      sortColumn: 'createdAt',
      sortType: 'desc',
      ...receiverIdQuery,
    },
    listKey
  );
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    setLoading(false);
  }, [queryResponse]);

  const handleContainerOnBottom = useCallback(() => {
    if (loading || praisePagination.currentPage === praisePagination.totalPages)
      return;

    setLoading(true);
    setNextPageNumber(praisePagination.currentPage + 1);
  }, [praisePagination, loading, setNextPageNumber]);

  if (loading)
    return (
      <div className="p-20">
        <LoaderSpinner />
      </div>
    );

  /* This will trigger handleOnDocumentBottom when the body of the page hits the bottom */
  return <BottomScrollListener onBottom={handleContainerOnBottom} />;
};
