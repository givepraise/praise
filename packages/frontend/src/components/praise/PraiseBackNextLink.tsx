import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { AllPraiseQueryPaginationInterface } from '@/model/praise';

interface Params {
  praisePagination: AllPraiseQueryPaginationInterface;
  onClick: (newPage) => void;
}

export const PraiseBackNextLink = ({
  praisePagination,
  onClick,
}: Params): JSX.Element => {
  return (
    <div className="grid grid-cols-2 px-5 mt-5">
      <div className="text-left">
        {praisePagination.hasPrevPage && (
          <a
            onClick={(): void => onClick(praisePagination.currentPage - 1)}
            className="cursor-pointer"
          >
            <FontAwesomeIcon icon={faArrowLeft} size="1x" className="mr-2" />
            Back
          </a>
        )}
      </div>
      <div className="text-right">
        {praisePagination.hasNextPage && (
          <a
            onClick={(): void => onClick(praisePagination.currentPage + 1)}
            className="cursor-pointer"
          >
            Next
            <FontAwesomeIcon icon={faArrowRight} size="1x" className="ml-2" />
          </a>
        )}
      </div>
    </div>
  );
};
