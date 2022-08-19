import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface VerticalBarProps {
  data: ChartData<'bar', number[], unknown>;
  options: ChartOptions<'bar'>;
}

export const VerticalBar = ({
  data,
  options,
}: VerticalBarProps): JSX.Element => {
  return (
    <div>
      <Bar options={options} data={data} />
    </div>
  );
};
