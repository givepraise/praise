import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { ChartData, ChartOptions } from 'chart.js';
import { PeriodPageParams } from '@/model/periods/periods';
import { PeriodQuantScoreDistribution } from '@/model/periods/periodAnalytics';
import { SinglePeriodSettingValueRealized } from '@/model/periodsettings/periodsettings';
import { VerticalBar } from './VerticalBar';

export const ScoreDistribution = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const scoreDistribution = useRecoilValue(
    PeriodQuantScoreDistribution(periodId)
  );
  const allowedValues = useRecoilValue(
    SinglePeriodSettingValueRealized({
      periodId,
      key: 'PRAISE_QUANTIFY_ALLOWED_VALUES',
    })
  ) as string;

  const allowedValuesArray = allowedValues.split(',').map((value) => {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) return 0;
    return parsedValue;
  });

  if (!scoreDistribution) return null;

  const sortedScoreDistribution = [...scoreDistribution.entries()].sort(
    (a, b) => a[0] - b[0]
  );
  const scoreDistributionOnlyAllowedValues = sortedScoreDistribution.filter(
    (entry) => allowedValuesArray.includes(entry[0])
  );

  const options: ChartOptions<'bar'> = {
    scales: {
      x: {
        ticks: {
          color: 'rgb(168, 162, 158)',
        },
        grid: {
          color: 'rgb(168, 162, 158, 0.5)',
        },
      },
      y: {
        ticks: {
          color: 'rgb(168, 162, 158)',
        },
        grid: {
          color: 'rgb(168, 162, 158, 0.5)',
        },
      },
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

  const data: ChartData<'bar', number[], unknown> = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    labels: scoreDistributionOnlyAllowedValues.map(([score, count]) => score),
    datasets: [
      {
        label: 'Count',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        data: scoreDistributionOnlyAllowedValues.map(([score, count]) => count),
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
