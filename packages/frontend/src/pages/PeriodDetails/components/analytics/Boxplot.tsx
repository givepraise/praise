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
import { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { Theme } from '@/model/theme';

// register controller in chart.js and ensure the defaults are set
ChartJS.register(BoxPlotController, BoxAndWiskers, LinearScale, CategoryScale);

export interface BoxPlotProps {
  data: ChartData<'boxplot', BoxPlotDataPoint[], unknown>;
  options: ChartOptions<'boxplot'>;
}

export const BoxPlot = ({ data, options }: BoxPlotProps): JSX.Element => {
  const chartRef = useRef(null);
  const theme = useRecoilValue(Theme);

  useEffect(() => {
    if (!chartRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chart = chartRef.current as any;
    const scales = chart.config.options.scales;
    if (theme === 'Dark') {
      scales.x.grid.color = 'rgb(168, 162, 158, 0.5)';
      scales.x.ticks.color = 'rgb(255, 255, 255)';
      scales.y.grid.color = 'rgb(168, 162, 158, 0.5)';
      scales.y.ticks.color = 'rgb(168, 162, 158)';
    } else {
      scales.x.grid.color = 'rgb(168, 162, 158, 0.5)';
      scales.x.ticks.color = 'rgb(41, 37, 36)';
      scales.y.grid.color = 'rgb(168, 162, 158, 0.5)';
      scales.y.ticks.color = 'rgb(168, 162, 158)';
    }
    chart.update();
  }, [chartRef, theme]);

  return (
    <div>
      <Chart type="boxplot" data={data} options={options} ref={chartRef} />
    </div>
  );
};
