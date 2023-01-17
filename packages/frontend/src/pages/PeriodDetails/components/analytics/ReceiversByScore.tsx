import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { ChartData, ChartOptions } from 'chart.js';
import { TreemapDataPoint } from 'chartjs-chart-treemap';
import {
  PeriodPageParams,
  SinglePeriod,
  useLoadSinglePeriodDetails,
} from '@/model/periods/periods';
import { UserDataPoint, Treemap } from './Treemap';

export const ReceiversByScore = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  useLoadSinglePeriodDetails(periodId);
  const period = useRecoilValue(SinglePeriod(periodId));
  const history = useHistory();

  if (!period || !period.receivers) return null;

  const sortReceiversByScore = [...period.receivers].sort(
    (a, b) => b.score - a.score
  );

  const leafs = period.receivers.map((receiver) => {
    return {
      _id: receiver._id,
      name: receiver.name || '',
      size: receiver.score,
      opacity: (receiver.score / sortReceiversByScore[0].score) * 1.0 + 0.1,
    };
  });

  const data: ChartData<'treemap', TreemapDataPoint[], unknown> = {
    datasets: [
      {
        label: 'Score received',
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
        history.push(`/periods/${periodId}/receiver/${id}`);
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
