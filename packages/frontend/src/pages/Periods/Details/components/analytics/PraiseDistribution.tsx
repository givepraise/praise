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

  const chartDataTest2 = [
    { from: 'User1', to: 'User2', flow: 23.67 },
    { from: 'User1', to: 'User3', flow: 25.33 },
    { from: 'User1', to: 'User4', flow: 41 },
    { from: 'User1', to: 'User5', flow: 31.33 },
    { from: 'User1', to: 'User6', flow: 11.33 },
    { from: 'User1', to: 'User7', flow: 15.13 },
    { from: 'User1', to: 'User8', flow: 2.67 },
    { from: 'User1', to: 'User9', flow: 1.1 },
    { from: 'User1', to: 'User10', flow: 8 },
    { from: 'User1', to: 'User11', flow: 18.33 },
    { from: 'User1', to: 'User3', flow: 52.33 },
    { from: 'User1', to: 'User12', flow: 5.33 },
    { from: 'User1', to: 'User13', flow: 16 },
    { from: 'User1', to: 'User14', flow: 18.33 },
    { from: 'User1', to: 'User7', flow: 16.67 },
    { from: 'User1', to: 'User14', flow: 0.67 },
    { from: 'User1', to: 'User4', flow: 0.43 },
    { from: 'User1', to: 'User8', flow: 1 },
    { from: 'User1', to: 'User11', flow: 4 },
    { from: 'User1', to: 'User10', flow: 2.47 },
    { from: 'User1', to: 'User15', flow: 48.87 },
    { from: 'User1', to: 'User7', flow: 9.13 },
    { from: 'User1', to: 'User12', flow: 6 },
    { from: 'User1', to: 'User10', flow: 3.13 },
    { from: 'User1', to: 'User14', flow: 22.67 },
    { from: 'User1', to: 'User7', flow: 2.53 },
    { from: 'User1', to: 'User8', flow: 3.67 },
    { from: 'User1', to: 'User4', flow: 41.43 },
    { from: 'User1', to: 'User5', flow: 20.33 },
    { from: 'User1', to: 'User6', flow: 5.03 },
    { from: 'User1', to: 'User3', flow: 52.5 },
    { from: 'User1', to: 'User16', flow: 1.7 },
    { from: 'User1', to: 'User1', flow: 1.33 },
    { from: 'User1', to: 'User1', flow: 4.33 },
    { from: 'User1', to: 'User6', flow: 15.67 },
    { from: 'User1', to: 'User14', flow: 6.17 },
    { from: 'User1', to: 'User9', flow: 6 },
    { from: 'User4', to: 'User17', flow: 17.33 },
    { from: 'User5', to: 'User12', flow: 1.33 },
    { from: 'User6', to: 'User10', flow: 2.13 },
    { from: 'User7', to: 'User17', flow: 19.67 },
    { from: 'User9', to: 'User4', flow: 3.33 }
  ];

  // Prepare data for chart
  const chartData = prizes?.map((prize) => {
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
        data: chartDataTest2,
        // colorFrom: (c) => getColor(c.dataset.data[c.dataIndex].from),
        colorFrom: () => '#E94998',
        // colorTo: (c) => getColor(c.dataset.data[c.dataIndex].to),
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
