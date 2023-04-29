import { DuckDbContext } from './DuckDb';
import { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import * as Graph from './layout';
import React from 'react';
import { Praise as PraiseDto } from '../../../model/praise/praise.dto';
import { UserAccount } from '../../../model/useraccount/dto/user-account.dto';
import { User } from '../../../model/user/dto/user.dto';
import { Praise } from '../../../components/praise/Praise';
import { PraiseRow } from '../../../components/praise/PraiseRow';
import { Link } from 'react-router-dom';

const topPraiseQuery = async (
  conn: AsyncDuckDBConnection,
  d1: string,
  d2: string
): Promise<PraiseDto[]> => {
  const result = await conn.query(`SELECT 
        p.*,
        gu.username AS giver_users_username, gu.identityEthAddress AS giver_users_identityEthAddress, gu.rewardsEthAddress AS giver_users_rewardsEthAddress, gu.roles AS giver_users_roles, gu.createdAt AS giver_users_createdAt, gu.updatedAt AS giver_users_updatedAt,
        gac.accountId AS giver_useraccounts_accountId, gac.user as giver_useraccounts_user, gac.name AS giver_useraccounts_name, gac.avatarId AS giver_useraccounts_avatarId, gac.platform AS giver_useraccounts_platform, gac.createdAt AS giver_useraccounts_createdAt, gac.updatedAt AS giver_useraccounts_updatedAt,
        ru.username AS receiver_users_username, ru.identityEthAddress AS receiver_users_identityEthAddress, ru.rewardsEthAddress AS receiver_users_rewardsEthAddress, ru.roles AS receiver_users_roles, ru.createdAt AS receiver_users_createdAt, ru.updatedAt AS receiver_users_updatedAt,
        rac.accountId AS receiver_useraccounts_accountId, rac.user as receiver_useraccounts_user, rac.name AS receiver_useraccounts_name, rac.avatarId AS receiver_useraccounts_avatarId, rac.platform AS receiver_useraccounts_platform, rac.createdAt AS receiver_useraccounts_createdAt, rac.updatedAt AS receiver_useraccounts_updatedAt
      FROM praises AS p
      LEFT JOIN useraccounts AS gac ON p.giver = gac._id
      LEFT JOIN users AS gu ON gac.user = gu._id
      LEFT JOIN useraccounts AS rac ON p.receiver = rac._id
      LEFT JOIN users AS ru ON rac.user = ru._id
      WHERE p.createdAt > '${d1}' AND p.createdAt <= '${d2}'         
      ORDER BY p.score DESC
      LIMIT 5
    ;`);

  const topPraise = result.toArray().map((row) => {
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

  return topPraise;
};

const TopPraise = ({
  date1,
  date2,
  date3,
}: {
  date1: string;
  date2: string;
  date3: string;
}): JSX.Element | null => {
  const dbContext = React.useContext(DuckDbContext);
  const [data, setData] = React.useState<PraiseDto[] | null>(null);

  /**
   * Load data from DuckDB.
   */
  React.useEffect(() => {
    if (!dbContext?.db || !dbContext?.tablesLoaded) return;
    const run = async (): Promise<void> => {
      if (!dbContext?.db) return;
      const conn = await dbContext.db.connect();
      setData(await topPraiseQuery(conn, date2, date3));
    };
    void run();
  }, [dbContext, date2, date1, date3]);

  if (!data) return <Graph.LoadPlaceholder />;

  return (
    <Graph.Frame className="px-0">
      <Graph.Header className="px-5">Highest scored praise</Graph.Header>
      <div className="@container">
        <ul className="px-5 text-xs  md:px-0">
          {data.map((praise) => (
            <PraiseRow praise={praise} key={praise._id}>
              <Praise praise={praise} key={praise._id} bigGiverAvatar={false} />
            </PraiseRow>
          ))}
        </ul>
      </div>
      <div className="px-5">
        See{' '}
        <Link
          to={`/reports/run?report=top-praise&startDate=${date2}&endDate=${date3}`}
        >
          full report
        </Link>
      </div>
    </Graph.Frame>
  );
};

export default TopPraise;
