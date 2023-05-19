import React from 'react';
import { useReportRunReturn } from '../../../model/report/types/use-report-run-return.type';
import { User } from '../../../model/user/dto/user.dto';
import { UserAccount } from '../../../model/useraccount/dto/user-account.dto';
import { Praise as PraiseDto } from '../../../model/praise/praise.dto';
import { Praise } from '../../../components/praise/Praise';
import { PraiseRow } from '../../../components/praise/PraiseRow';

export const TopPraise = ({
  report,
}: {
  report: useReportRunReturn;
}): JSX.Element => {
  const topPraise = React.useMemo(() => {
    if (!Array.isArray(report.rows)) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyRows = report.rows as any[];
    return anyRows.map((row) => {
      const giverUser = {
        _id: row.giver_useraccounts_user,
        identityEthAddress: row.giver_users_identityEthAddress,
        rewardsEthAddress: row.giver_users_rewardsEthAddress,
        username: row.giver_users_username,
        roles: row.giver_users_roles,
        createdAt: new Date(row.giver_users_createdAt).toISOString(),
        updatedAt: new Date(row.giver_users_updatedAt).toISOString(),
      } as User;

      const giver = {
        _id: row.giver,
        user: giverUser,
        accountId: row.giver_useraccounts_accountId,
        name: row.giver_useraccounts_name,
        avatarId: row.giver_useraccounts_avatarId,
        platform: row.giver_useraccounts_platform,
        createdAt: row.giver_useraccounts_createdAt,
        updatedAt: row.giver_useraccounts_updatedAt,
      } as UserAccount;

      const receiverUser = {
        _id: row.receiver_useraccounts_user,
        identityEthAddress: row.receiver_users_identityEthAddress,
        rewardsEthAddress: row.receiver_users_rewardsEthAddress,
        username: row.receiver_users_username,
        roles: row.receiver_users_roles,
        createdAt: row.receiver_users_createdAt,
        updatedAt: row.receiver_users_updatedAt,
      } as User;

      const receiver = {
        _id: row.receiver as string,
        user: receiverUser,
        accountId: row.receiver_useraccounts_accountId,
        name: row.receiver_useraccounts_name,
        avatarId: row.receiver_useraccounts_avatarId,
        platform: row.receiver_useraccounts_platform,
        createdAt: row.receiver_useraccounts_createdAt,
        updatedAt: row.receiver_useraccounts_updatedAt,
      } as UserAccount;

      const praise = {
        _id: row._id,
        reason: row.reason,
        reasonRaw: row.reasonRaw,
        sourceId: row.sourceId,
        sourceName: row.sourceName,
        quantifications: [],
        giver: giver,
        receiver: receiver,
        forwarder: undefined,
        score: row.score,
        createdAt: new Date(row.createdAt).toISOString(),
        updatedAt: row.updatedAt,
      } as PraiseDto;
      return praise;
    });
  }, [report]);

  return (
    <div>
      <div className="@container">
        <ul className="px-5 md:px-0">
          {topPraise.map((praise) => (
            <PraiseRow praise={praise} key={praise._id}>
              <Praise praise={praise} key={praise._id} bigGiverAvatar={false} />
            </PraiseRow>
          ))}
        </ul>
      </div>
    </div>
  );
};
