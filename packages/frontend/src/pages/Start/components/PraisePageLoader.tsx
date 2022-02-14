import LoaderSpinner from '@/components/LoaderSpinner';
import { AllPraiseQueryPagination, useAllPraiseQuery } from '@/model/praise';
import React, { useCallback } from 'react';
import { BottomScrollListener } from 'react-bottom-scroll-listener';
import { useRecoilState } from 'recoil';
import { ALL_PRAISE_LIST_KEY } from './PraiseTable';

const PraisePageLoader = () => {
  const [praisePagination, setPraisePagination] = useRecoilState(
    AllPraiseQueryPagination(ALL_PRAISE_LIST_KEY)
  );
  const queryRepsponse = useAllPraiseQuery(
    {
      page: praisePagination.currentPage,
      limit: 20,
      sortColumn: 'createdAt',
      sortType: 'desc',
    },
    ALL_PRAISE_LIST_KEY
  );
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(false);
  }, [queryRepsponse]);

  const handleContainerOnBottom = useCallback(() => {
    if (
      loading ||
      praisePagination.currentPage >= praisePagination.totalPages - 1
    )
      return;
    setLoading(true);

    setTimeout(() => {
      setPraisePagination({
        ...praisePagination,
        currentPage: praisePagination.currentPage + 1,
      });
    }, 1000);
  }, [praisePagination, loading, setPraisePagination]);

  if (loading) return <LoaderSpinner />;

  /* This will trigger handleOnDocumentBottom when the body of the page hits the bottom */
  return (
    <BottomScrollListener
      onBottom={handleContainerOnBottom}
      triggerOnNoScroll
    />
  );
};

export default PraisePageLoader;
