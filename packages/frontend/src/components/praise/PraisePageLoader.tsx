import React, { useCallback, useState, useEffect } from 'react';
import { BottomScrollListener } from 'react-bottom-scroll-listener';
import { useRecoilValue } from 'recoil';
import {
  AllPraiseList,
  AllPraiseQueryPagination,
  useAllPraise,
} from '@/model/praise';
import { LoaderSpinner } from '@/components/ui/LoaderSpinner';

interface Params {
  listKey: string;
  receiverId?: string;
}

export const PraisePageLoader = ({
  listKey,
  receiverId,
}: Params): JSX.Element => {
  const allPraise = useRecoilValue(AllPraiseList(listKey));
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

  if (!Array.isArray(allPraise) || allPraise.length === 0)
    return (
      <div className="p-5">
        {receiverId
          ? 'You have not yet received any praise.'
          : 'No praise have been dished yet.'}
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
  /* This will trigger handleOnDocumentBottom when the body of the page hits the bottom */
  return <BottomScrollListener onBottom={handleContainerOnBottom} />;
};
