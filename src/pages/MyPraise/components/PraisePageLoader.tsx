import { AllPraisesQueryPagination, useAllPraisesQuery } from "@/model/praise";
import React, { useCallback } from "react";
import { BottomScrollListener } from "react-bottom-scroll-listener";
import { useRecoilState } from "recoil";

const PraisePageLoader = () => {
  const [praisePagination, setPraisePagination] = useRecoilState(
    AllPraisesQueryPagination
  );
  const queryRepsponse = useAllPraisesQuery({
    page: praisePagination.currentPageNumber,
    size: 4,
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(false);
  }, [queryRepsponse]);

  const handleContainerOnBottom = useCallback(() => {
    setLoading(true);
    if (praisePagination.currentPageNumber >= praisePagination.totalPages - 1)
      return;
    setPraisePagination({
      ...praisePagination,
      currentPageNumber: praisePagination.currentPageNumber + 1,
    });
  }, [praisePagination, setPraisePagination]);

  if (loading) return null;

  /* This will trigger handleOnDocumentBottom when the body of the page hits the bottom */
  return (
    <BottomScrollListener
      onBottom={handleContainerOnBottom}
      triggerOnNoScroll
    />
  );
};

export default PraisePageLoader;
