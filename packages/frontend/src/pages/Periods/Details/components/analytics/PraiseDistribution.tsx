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

  const chartDataTest = [
    { from: 'a', to: 'b', flow: 10 },
    { from: 'a', to: 'c', flow: 5 },
    { from: 'b', to: 'c', flow: 10 },
    { from: 'd', to: 'c', flow: 7 },
  ];

  // Prepare data for chart
  const chartData = prizes?.map((prize) => {
    return {
      from: prize.giver.nameRealized,
      to: prize.receiver.nameRealized,
      flow: prize.scoreRealized,
    };
  });

  const data: ChartData<'sankey', unknown> = {
    datasets: [
      {
        label: 'My sankey',
        data: chartData,
        // colorFrom: (c) => getColor(c.dataset.data[c.dataIndex].from),
        colorFrom: () => '#E94998',
        // colorTo: (c) => getColor(c.dataset.data[c.dataIndex].to),
        colorTo: () => '#FFFFFF',
        colorMode: 'gradient',
        priority: {
          b: 1,
          d: 0,
        },
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
