import { useHistory, useParams } from 'react-router-dom';
import { atom, useRecoilValue } from 'recoil';
import { ChartData, ChartOptions } from 'chart.js';
import { BoxPlotDataPoint } from '@sgratzl/chartjs-chart-boxplot';
import { PeriodPageParams } from '@/model/periods/periods';
import { PeriodPraiseOutliers } from '@/model/periods/periodAnalytics';
import { BoxPlot } from './Boxplot';
import { Pagination } from './Pagination';
import { Quantification } from '@/model/quantification/quantification.dto';

const QuantificationSpreadPagination = atom<number>({
  key: 'QuantificationSpreadPagination',
  default: 1,
});

const PAGE_SIZE = 25;

export const QuantificationSpread = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const praiseDetailsStats = useRecoilValue(PeriodPraiseOutliers(periodId));
  const history = useHistory();
  const page = useRecoilValue(QuantificationSpreadPagination);

  if (!praiseDetailsStats) return null;

  const sortedPraiseDetailsStats = [...praiseDetailsStats].sort(
    (a, b) => b.scoreSpread - a.scoreSpread
  );

  const lastPage = Math.floor(sortedPraiseDetailsStats.length / PAGE_SIZE);

  const data = sortedPraiseDetailsStats.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const options: ChartOptions<'boxplot'> = {
    onClick: (event, elements): void => {
      const id = data[elements[0].index]._id;
      if (id) {
        history.push(`/praise/${id}`);
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function (a) {
            const p = data[a[0].dataIndex];
            return p.reason.length > 80
              ? `${p.reason.substring(0, 80)}...`
              : p.reason;
          },
        },
      },
    },
    scales: {
      x: {
        display: false,
      },
    },
  };
  const boxplotData: ChartData<'boxplot', BoxPlotDataPoint[], unknown> = {
    labels: data.map(() => ''),
    datasets: [
      {
        backgroundColor: 'rgb(225, 0, 127,0.8)',
        borderColor: 'rgb(225, 0, 127,1)',
        borderWidth: 1,
        itemRadius: 0,
        data: data.map((p) =>
          p.quantifications.map((q: Quantification) => q.score)
        ),
      },
    ],
  };

  return (
    <>
      <BoxPlot data={boxplotData} options={options} />
      <Pagination lastPage={lastPage} state={QuantificationSpreadPagination} />
    </>
  );
};
