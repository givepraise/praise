import {
  AllAdminUsers,
  AllForwarderUsers,
  AllQuantifierUsers,
  AllUsers,
} from '@/model/users';
import { getUsername } from '@/utils/users';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { UserDto, UserRole } from 'api/dist/user/types';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UsersTableRow from './UsersTableRow';
import UsersTablePagination from './UsersTablePagination';

const roleOptions = [
  { name: 'All users', value: UserRole.USER },
  { name: 'Admins', value: UserRole.ADMIN },
  { name: 'Forwarders', value: UserRole.FORWARDER },
  { name: 'Quantifiers', value: UserRole.QUANTIFIER },
];

const UsersTable = (): JSX.Element => {
  const allAdminUsers = useRecoilValue(AllAdminUsers);
  const allForwarderUsers = useRecoilValue(AllForwarderUsers);
  const allQuantifierUsers = useRecoilValue(AllQuantifierUsers);
  const allUsers = useRecoilValue(AllUsers);
  const [tableData, setTableData] = React.useState<UserDto[]>();
  const [selectedRole, setSelectedRole] = React.useState<UserRole>(
    UserRole.USER
  );
  const [filter, setFilter] = React.useState<string>('');
  const [filterType, setFilterType] = React.useState<string>('user');
  const [page, setPage] = React.useState<number>(1);
  const [lastPage, setLastPage] = React.useState<number>(0);

  React.useEffect(() => {
    if (allUsers) {
      setTableData(allUsers);
    }
  }, [allUsers]);

  React.useEffect(() => {
    if (filter && tableData) {
      let filteredData: UserDto[];
      if (filterType === 'user') {
        filteredData = tableData.filter((user) => {
          const username = getUsername(user)?.toLowerCase();
          if (username?.includes(filter.toLocaleLowerCase())) {
            return user;
          }
        });
      } else {
        filteredData = tableData.filter((user) => {
          if (
            user.ethereumAddress?.toLocaleLowerCase() ===
            filter.toLocaleLowerCase()
          ) {
            return user;
          }
        });
      }
      setTableData(filteredData);
    }
  }, [filterType, filter]);

  React.useEffect(() => {
    switch (selectedRole) {
      case UserRole.USER:
        setTableData(allUsers);
        break;
      case UserRole.ADMIN:
        setTableData(allAdminUsers);
        break;
      case UserRole.FORWARDER:
        setTableData(allForwarderUsers);
        break;
      case UserRole.QUANTIFIER:
        setTableData(allQuantifierUsers);
        break;
    }
    setFilter('');
  }, [selectedRole]);

  React.useEffect(() => {
    if (tableData) {
      setPage(1);

      if (tableData.length % 5 === 0) {
        setLastPage(Math.trunc(tableData.length / 5));
      } else {
        setLastPage(Math.trunc(tableData.length / 5) + 1);
      }
    }
  }, [tableData]);

  return (
    <div>
      <div className="flex gap-8">
        <select
          className="bg-transparent border-black"
          onChange={(event: React.ChangeEvent<HTMLSelectElement>): void =>
            setSelectedRole(UserRole[event.target.value])
          }
        >
          {roleOptions.map((option) => (
            <option key={option.name} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
        <div className="flex items-center border border-black">
          <label className="relative">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              size="1x"
              className="absolute top-1/2 transform -translate-y-1/2 left-3"
            />
            <input
              type="text"
              name="search"
              placeholder="Search"
              className="bg-transparent outline-none border-none focus:ring-0 block pl-8"
              value={filter}
              onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
                setFilter(event.target.value)
              }
            />
          </label>
          <hr className="border-black w-6 rotate-90" />
          <select
            className="bg-transparent outline-none border-none focus:ring-0"
            onChange={(event: React.ChangeEvent<HTMLSelectElement>): void =>
              setFilterType(UserRole[event.target.value])
            }
          >
            <option value="user">User</option>
            <option value="discord">Discord</option>
          </select>
        </div>
      </div>
      <div className="flex justify-between px-4 mt-8">
        <div className="w-1/3">
          <span className="font-bold">User</span>
        </div>
        <div className="w-1/3">
          <span className="font-bold">Discord</span>
        </div>
        <div className="w-1/3">
          <span className="font-bold">Roles</span>
        </div>
      </div>
      <React.Suspense fallback="Loading...">
        {tableData?.map((row, index) => {
          if (Math.trunc(index / 5) + 1 === page) {
            return <UsersTableRow key={row._id} data={row} />;
          }
        })}
      </React.Suspense>
      <UsersTablePagination lastPage={lastPage} page={page} setPage={setPage} />
    </div>
  );
};

export default UsersTable;
