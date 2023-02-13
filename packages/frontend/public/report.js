const manifest = {
  name: 'period-score-summary',
  displayName: 'Period Summary',
  description:
    'Summarizes period praise receivers, scores and number of praise.',
  version: '0.0.1',
  author: 'Praise',
  publisher: 'praise',
  license: 'GPL-3.0',
  repository: 'https://github.com/givepraise/praise-reports',
  bugs: 'https://github.com/givepraise/praise-reports/issues',
  categories: ['Basic reports', 'Period reports'],
  keywords: ['praise', 'period', 'score', 'summary'],
  configuration: {},
};

class Report {
  manifest() {
    return manifest;
  }

  validateConfig(config) {
    return true;
  }

  run(config, db) {
    const { startDate, endDate } = config;

    const where =
      startDate && endDate
        ? ` WHERE praises.createdAt > '${startDate}' AND praises.createdAt <= '${endDate}'`
        : '';

    let sql = `SELECT 
      users.username, 
      ANY_VALUE(users.identityEthAddress) as identity_eth_address, 
      ANY_VALUE(users.rewardsEthAddress) as rewards_eth_address, 
      count(praises) AS praise_count, 
      round(sum(praises.score), 2) AS score 
      FROM praises 
      LEFT JOIN useraccounts ON praises.receiver = useraccounts._id
      LEFT JOIN users ON useraccounts.user = users._id
      ${where}
      GROUP BY users.username
      ORDER BY score DESC
    ;`;

    return db.query(sql);
  }
}

() => new Report();
