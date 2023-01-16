import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, ChartData, ChartOptions } from 'chart.js';
import {
  TreemapController,
  TreemapDataPoint,
  TreemapElement,
} from 'chartjs-chart-treemap';

ChartJS.register(TreemapController, TreemapElement);

interface UserLeafData {
  _id: string;
  name: string;
  size: number;
  opacity: number;
}

export interface UserDataPoint extends TreemapDataPoint {
  _data: UserLeafData;
}

export interface TreemapProps {
  data: ChartData<'treemap', TreemapDataPoint[], unknown>;
  options: ChartOptions<'treemap'>;
}

export const Treemap = ({ data, options }: TreemapProps): JSX.Element => {
  return (
    <div>
      <Chart type="treemap" data={data} options={options} />
    </div>
  );
};
