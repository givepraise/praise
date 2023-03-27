import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { ChartData, ChartOptions } from 'chart.js';
import { BoxPlotDataPoint } from '@sgratzl/chartjs-chart-boxplot';

import { PeriodPageParams } from '@/model/periods/periods';
import { AllPeriodQuantificationsGroupedByQuantifier } from '@/model/periods/periodAnalytics';
import { ManyUsers } from '@/model/user/users';
import { BoxPlot } from './Boxplot';
import { Quantification } from '@/model/quantification/quantification.dto';

export const QuantifierScoringDistribution = (): JSX.Element | null => {
  const { periodId } = useParams<PeriodPageParams>();
  const history = useHistory();
  const quantifierQuants = useRecoilValue(
    AllPeriodQuantificationsGroupedByQuantifier(periodId)
  );
  const quantifierUsers = useRecoilValue(
    ManyUsers(quantifierQuants && [...quantifierQuants.keys()])
  );
  const userNames =
    quantifierUsers && quantifierUsers.map((user) => user?.username);

  if (!quantifierQuants || !userNames) return null;

  const options: ChartOptions<'boxplot'> = {
    onClick: (event, elements): void => {
      const id = quantifierUsers[elements[0].index]?._id;
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
  const boxplotData: ChartData<'boxplot', BoxPlotDataPoint[], unknown> = {
    labels: userNames,
    datasets: [
      {
        backgroundColor: 'rgb(225, 0, 127,0.8)',
        borderColor: 'rgb(225, 0, 127,1)',
        borderWidth: 1,
        itemRadius: 0,
        data: [...quantifierQuants.values()].map((q: Quantification[]) =>
          q.map((q: Quantification) => q.score)
        ),
      },
    ],
  };

  return <BoxPlot data={boxplotData} options={options} />;
};
