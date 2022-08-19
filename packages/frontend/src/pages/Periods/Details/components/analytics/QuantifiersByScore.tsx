import 'chart.js/auto';

import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { ChartData, ChartOptions } from 'chart.js';
import { TreemapDataPoint } from 'chartjs-chart-treemap';
import { PeriodPageParams, SinglePeriod } from '@/model/periods';
import { ErrorPlaceholder } from '@/components/analytics/ErrorPlaceholder';
import { PeriodQuantifierStats } from '@/model/periodAnalytics';
import { ManyUsers } from '@/model/users';
import { UserDataPoint, Treemap } from './Treemap';

export const QuantifiersByScore = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const history = useHistory();
  const period = useRecoilValue(SinglePeriod(periodId));
  const allQuantifierStats = useRecoilValue(PeriodQuantifierStats(periodId));
  const quantifierUsers = useRecoilValue(
    ManyUsers(allQuantifierStats && allQuantifierStats.map((q) => q._id))
  );

  if (!period || !period.receivers || !allQuantifierStats) {
    return <ErrorPlaceholder height={600} />;
  }

  const sortStatsScore = [...allQuantifierStats].sort(
    (a, b) => b.totalScore - a.totalScore
  );

  const leafs = allQuantifierStats.map((q) => {
    return {
      _id: q._id,
      name: quantifierUsers?.find((u) => u?._id === q._id)?.nameRealized || '',
      size: q.totalScore,
      opacity: (q.totalScore / sortStatsScore[0].totalScore) * 1.0 + 0.1,
    };
  });

  const data: ChartData<'treemap', TreemapDataPoint[], unknown> = {
    datasets: [
      {
        label: 'Total quantification score',
        tree: leafs,
        data: [],
        backgroundColor: (ctx): string => {
          if (ctx.type !== 'data') {
            return 'transparent';
          }
          return `rgb(225, 0, 127, ${
            (ctx.raw as UserDataPoint)._data.opacity
          })`;
        },
        key: 'size',
        labels: {
          display: true,
          formatter(ctx): string {
            return (ctx.raw as UserDataPoint)._data.name;
          },
          color: 'white',
          font: {
            size: 12,
          },
          position: 'middle',
        },
        borderWidth: 0,
        spacing: 2,
      },
    ],
  };

  const options: ChartOptions<'treemap'> = {
    onClick: (event, elements): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const id = (elements[0].element as any).$context.raw._data._id;
      if (id) {
        history.push(`/periods/${periodId}/quantifier/${id}`);
      }
    },

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

  return (
    <div>
      <Treemap data={data} options={options} />
    </div>
  );
};
