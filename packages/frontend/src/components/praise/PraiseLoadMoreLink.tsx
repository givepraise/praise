import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AllPraiseQueryPaginationInterface } from '@/model/praise';

interface Params {
  praisePagination: AllPraiseQueryPaginationInterface;
  onClick: () => void;
}

export const PraiseLoadMoreLink = ({
  praisePagination,
  onClick,
}: Params): JSX.Element => {
  return (
    <div className="mt-5 text-center">
      {praisePagination.currentPage !== praisePagination.totalPages && (
        <a
          onClick={onClick}
          className="cursor-pointer hover:text-warm-gray-500 dark:hover:text-warm-gray-300"
        >
          Load More
          <FontAwesomeIcon icon={faAngleDown} size="1x" className="ml-2 " />
        </a>
      )}
    </div>
  );
};
