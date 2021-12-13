import { AllPraisesQueryPagination, useAllPraisesQuery } from "@/model/praise";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback } from "react";
import { useBottomScrollListener } from "react-bottom-scroll-listener";
import { useRecoilState } from "recoil";

const PraisePageLoader = () => {
  const [praisePagination, setPraisePagination] = useRecoilState(
    AllPraisesQueryPagination
  );

  useAllPraisesQuery({ page: praisePagination.currentPageNumber, size: 10 });

  const handleContainerOnBottom = useCallback(() => {
    if (praisePagination.currentPageNumber >= praisePagination.totalPages - 1)
      return;

    setPraisePagination({
      ...praisePagination,
      currentPageNumber: praisePagination.currentPageNumber + 1,
    });
  }, [praisePagination, setPraisePagination]);

  /* This will trigger handleOnDocumentBottom when the body of the page hits the bottom */
  useBottomScrollListener(handleContainerOnBottom, {
    triggerOnNoScroll: true,
    debounce: 2000,
  });

  if (praisePagination.currentPageNumber >= praisePagination.totalPages - 1)
    return null;

  return (
    <div className="w-full mt-2 text-center">
      <FontAwesomeIcon
        icon={faSpinner}
        size="1x"
        spin
        className="inline-block mr-4"
      />
    </div>
  );
};

export default PraisePageLoader;
