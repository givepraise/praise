import React from 'react';
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IUsersTablePagination {
  lastPage: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const UsersTablePagination = ({
  lastPage,
  page,
  setPage,
}: IUsersTablePagination): JSX.Element => {
  return (
    <div className="flex gap-2 items-center select-none mt-8 pl-4">
      <FontAwesomeIcon
        icon={faAnglesLeft}
        size="lg"
        className="cursor-pointer"
        onClick={(): void => setPage(1)}
      />
      <FontAwesomeIcon
        icon={faAngleLeft}
        size="lg"
        className="cursor-pointer"
        onClick={(): void =>
          setPage((previousPage) =>
            previousPage === 1 ? previousPage : previousPage - 1
          )
        }
      />
      <FontAwesomeIcon
        icon={faAngleRight}
        size="lg"
        className="cursor-pointer"
        onClick={(): void =>
          setPage((previousPage) =>
            previousPage === lastPage ? lastPage : previousPage + 1
          )
        }
      />
      <FontAwesomeIcon
        icon={faAnglesRight}
        size="lg"
        className="cursor-pointer"
        onClick={(): void => setPage(lastPage)}
      />
      <span>
        Page {page} of {lastPage}
      </span>
    </div>
  );
};

export default UsersTablePagination;
