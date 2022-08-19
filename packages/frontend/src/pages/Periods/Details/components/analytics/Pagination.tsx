import React from 'react';
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RecoilState, useRecoilState } from 'recoil';

interface PaginationProps {
  lastPage: number;
  state: RecoilState<number>;
}

export const Pagination = ({
  lastPage,
  state,
}: PaginationProps): JSX.Element => {
  const [page, setPage] = useRecoilState(state);
  return (
    <div className="flex items-center gap-4 select-none pl-9">
      <FontAwesomeIcon
        icon={faAnglesLeft}
        size="sm"
        className="cursor-pointer"
        onClick={(): void => setPage(1)}
      />
      <FontAwesomeIcon
        icon={faAngleLeft}
        size="sm"
        className="cursor-pointer"
        onClick={(): void =>
          setPage((previousPage) =>
            previousPage === 1 ? previousPage : previousPage - 1
          )
        }
      />
      <FontAwesomeIcon
        icon={faAngleRight}
        size="sm"
        className="cursor-pointer"
        onClick={(): void =>
          setPage((previousPage) =>
            previousPage === lastPage ? lastPage : previousPage + 1
          )
        }
      />
      <FontAwesomeIcon
        icon={faAnglesRight}
        size="sm"
        className="cursor-pointer"
        onClick={(): void => setPage(lastPage)}
      />
      <span>
        Page {page} of {lastPage}
      </span>
    </div>
  );
};
