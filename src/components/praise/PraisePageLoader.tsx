import { AllPraisesQueryPagination, useAllPraisesQuery } from "@/model/praise";
import { useRecoilState } from "recoil";
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { useCallback, useEffect } from "react";

const PraisePageLoader = () => {
    const [praisePagination, setPraisePagination] = useRecoilState(
        AllPraisesQueryPagination
    );

    useAllPraisesQuery({ page: praisePagination.currentPageNumber, size: 10 });

    const handleContainerOnBottom = useCallback(() => {
        console.log('HERE');

        setPraisePagination({
            ...praisePagination,
            currentPageNumber: praisePagination.currentPageNumber + 1,
        })
      }, [praisePagination, setPraisePagination]);
    
    /* This will trigger handleOnDocumentBottom when the body of the page hits the bottom */
    useBottomScrollListener(handleContainerOnBottom, {
        triggerOnNoScroll: true,
        debounce: 2000
    });         
    
    if (praisePagination.currentPageNumber >= praisePagination.totalPages - 1)
        return null;             

    return (<div></div>);
}

export default PraisePageLoader;