import 'chart.js/auto';

import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  ChartOptions,
  ChartData,
} from 'chart.js';
import {
  BoxPlotController,
  BoxAndWiskers,
  BoxPlotDataPoint,
} from '@sgratzl/chartjs-chart-boxplot';

// register controller in chart.js and ensure the defaults are set
ChartJS.register(BoxPlotController, BoxAndWiskers, LinearScale, CategoryScale);

export interface BoxPlotProps {
  data: ChartData<'boxplot', BoxPlotDataPoint[], unknown>;
  options: ChartOptions<'boxplot'>;
}

export const BoxPlot = ({ data, options }: BoxPlotProps): JSX.Element => {
  return (
    <div>
      <Chart type="boxplot" data={data} options={options} />
    </div>
  );
};
