import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, ChartData, ChartOptions } from 'chart.js';
import { SankeyController, Flow } from 'chartjs-chart-sankey';
import { PeriodPageParams, AllPeriodPraise } from '@/model/periods';
// import { ErrorPlaceholder } from '@/components/analytics/ErrorPlaceholder';

ChartJS.register(SankeyController, Flow);

export const PraiseDistribution = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const prizes = useRecoilValue(AllPeriodPraise(periodId));

  // Prepare data for chart
  const chartDataFiltered = prizes?.filter(
    (prize) => prize.giver.nameRealized !== prize.receiver.nameRealized
  );

  const chartData = chartDataFiltered?.map((prize) => {
    return {
      from: prize.giver.nameRealized,
      to: prize.receiver.nameRealized,
      flow: prize.scoreRealized,
    };
  });

  console.log(chartData);

  const data: ChartData<'sankey', unknown> = {
    datasets: [
      {
        label: 'My sankey',
        data: chartData,
        colorFrom: () => '#E94998',
        colorTo: () => '#FFFFFF',
        colorMode: 'gradient',
        size: 'max', // or 'min' if flow overlap is preferred
      },
    ],
  };

  const options: ChartOptions<'sankey'> = {
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
      <Chart type="sankey" data={data} options={options} />
    </div>
  );
};
