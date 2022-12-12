import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import {
  AllPraiseList,
  AllPraiseQueryPagination,
  AllPraiseQueryParameters,
  useAllPraise,
} from '@/model/praise';
import { LoaderSpinner } from '@/components/ui/LoaderSpinner';
import { PraiseLoadMoreLink } from './PraiseLoadMoreLink';

interface Params {
  listKey: string;
  queryParams?: AllPraiseQueryParameters;
  onLoadMoreClick?: (page) => void;
}

export const PraisePageLoader = ({
  listKey,
  queryParams,
  onLoadMoreClick,
}: Params): JSX.Element => {
  const allPraise = useRecoilValue(AllPraiseList(listKey));
  const praisePagination = useRecoilValue(AllPraiseQueryPagination(listKey));

  const [nextPageNumber, setNextPageNumber] = useState<number>(
    praisePagination.currentPage + 1
  );

  const receiverQuery = queryParams?.receiver
    ? { receiver: queryParams.receiver }
    : {};

  const giverQuery = queryParams?.giver ? { giver: queryParams.giver } : {};

  const queryResponse = useAllPraise(
    {
      page: queryParams?.page ? queryParams.page : nextPageNumber,
      limit: queryParams?.limit ? queryParams?.limit : 30,
      sortColumn: queryParams?.sortColumn
        ? queryParams.sortColumn
        : 'createdAt',
      sortType: queryParams?.sortType ? queryParams.sortType : 'desc',
      ...receiverQuery,
      ...giverQuery,
    },
    listKey
  );

  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    setLoading(false);
  }, [queryResponse]);

  useEffect(() => {
    setLoading(true);
    if (queryParams && queryParams.page) {
      setNextPageNumber(queryParams.page);
    }
    setLoading(false);
  }, [queryParams?.page, queryParams]);

  const handleLoadMoreClick = (): void => {
    setNextPageNumber(praisePagination.currentPage + 1);

    if (onLoadMoreClick) {
      onLoadMoreClick(praisePagination.currentPage + 1);
    }
  };

  if (loading)
    return (
      <div className="p-20">
        <LoaderSpinner />
      </div>
    );

  if (!Array.isArray(allPraise) || allPraise.length === 0)
    return (
      <div className="p-5">
        {queryParams?.receiver
          ? 'The user has not yet received any praise.'
          : queryParams?.giver
          ? 'The user has not yet given any praise'
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

  return (
    <PraiseLoadMoreLink
      praisePagination={praisePagination}
      onClick={handleLoadMoreClick}
    />
  );
};
