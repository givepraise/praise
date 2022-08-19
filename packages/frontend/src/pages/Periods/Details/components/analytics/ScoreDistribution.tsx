import 'chart.js/auto';

import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { ChartData, ChartOptions } from 'chart.js';
import { PeriodPageParams } from '@/model/periods';
import { ErrorPlaceholder } from '@/components/analytics/ErrorPlaceholder';
import { PeriodQuantScoreDistribution } from '@/model/periodAnalytics';
import { VerticalBar } from './VerticalBar';

export const ScoreDistribution = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const scoreDistribution = useRecoilValue(
    PeriodQuantScoreDistribution(periodId)
  );

  if (!scoreDistribution) {
    return <ErrorPlaceholder height={600} />;
  }

  const sortedScoreDistribution = [...scoreDistribution.entries()].sort(
    (a, b) => a[0] - b[0]
  );

  const options: ChartOptions<'bar'> = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function (): string {
            return '';
          },
        },
      },
    },
  };

  const data: ChartData<'bar', number[], unknown> = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    labels: sortedScoreDistribution.map(([score, count]) => score),
    datasets: [
      {
        label: 'Count',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        data: sortedScoreDistribution.map(([score, count]) => count),
        backgroundColor: 'rgb(225, 0, 127, 0.8)',
      },
    ],
  };
  return (
    <div>
      <VerticalBar data={data} options={options} />
    </div>
  );
};
