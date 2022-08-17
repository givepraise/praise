import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { UserDto } from 'api/dist/user/types';
import { useState } from 'react';
import { CSVLink } from 'react-csv';
import { useRecoilValue } from 'recoil';

import {
  AllAdminUsers,
  AllForwarderUsers,
  AllQuantifierUsers,
  AllUsers,
} from '@/model/users';
import { Button } from '@/components/ui/Button';

interface DownloadUserDto extends Omit<UserDto, 'accounts'> {
  discordName?: string;
  discordAccountId?: string;
  telegramName?: string;
  telegramAccountId?: string;
  accounts?: string[];
}

export const UsersStatistics = (): JSX.Element => {
  const allAdminUsers = useRecoilValue(AllAdminUsers);
  const allForwarderUsers = useRecoilValue(AllForwarderUsers);
  const allQuantifierUsers = useRecoilValue(AllQuantifierUsers);
  const allUsers = useRecoilValue(AllUsers);
  const [downloadData, setDownloadData] = useState<DownloadUserDto[]>([]);

  const filterData = (): boolean => {
    if (!allUsers) {
      return false;
    }
    const data = allUsers.map((user) => {
      const discordAccount = user.accounts?.find(
        (account) => account.platform === 'DISCORD'
      );
      const telegramAccount = user.accounts?.find(
        (account) => account.platform === 'TELEGRAM'
      );
      return {
        ...user,
        discordAccountId: discordAccount?.accountId,
        discordName: discordAccount?.name,
        telegramAccountId: telegramAccount?.accountId,
        telegramName: telegramAccount?.name,
        accounts: user.accounts?.map((account) => account.platform),
      };
    });

    setDownloadData(data);
    return true;
  };

  return (
    <>
      <h2>User statistics</h2>
      <div>Activated users: {allUsers?.length}</div>
      <div>Admins: {allAdminUsers?.length}</div>
      <div>Forwarders: {allForwarderUsers?.length}</div>
      <div>Quantifiers: {allQuantifierUsers?.length}</div>
      <div className="flex w-full mt-5">
        {allUsers && (
          <Button>
            <CSVLink
              className="no-underline"
              data={downloadData}
              onClick={(): boolean => filterData()}
              separator={';'}
              filename={'PraiseUserExport.csv'}
            >
              <FontAwesomeIcon icon={faDownload} size="1x" className="mr-2" />
              Export
            </CSVLink>
          </Button>
        )}
      </div>
    </>
  );
};
