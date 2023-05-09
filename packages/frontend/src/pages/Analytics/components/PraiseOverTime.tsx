import { DuckDbContext } from './DuckDb';
import { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import * as Graph from './layout';
import { Line } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import { Theme } from '../../../model/theme';
import { useRecoilValue } from 'recoil';
import React from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type dataType = {
  createdAt: string;
  count: number;
  ordinal: number;
};

type GraphData = {
  count: number;
  countPrevious: number;
  data: dataType[];
  dataPrevious: dataType[];
};

const countQuery = async (
  conn: AsyncDuckDBConnection,
  d1: string,
  d2: string
): Promise<number> => {
  const result = await conn.query(`SELECT 
     CAST(COUNT(*) AS INTEGER) as count 
   FROM praises
   WHERE createdAt > '${d1}' AND createdAt <= '${d2}'         
   ;`);
  return result.toArray()[0].toJSON().count;
};

const praiseQuery = async (
  conn: AsyncDuckDBConnection,
  d1: string,
  d2: string
): Promise<dataType[]> => {
  const result = await conn.query(`SELECT         
      strftime(DATE_TRUNC('day', createdAt), '%a, %-d %B %Y') AS createdAt,
      CAST(COUNT(*) AS INTEGER) as count,
      CAST(DATEDIFF('day', CAST('${d1}' AS DATE), DATE_TRUNC('day', createdAt)) AS INTEGER) as ordinal
    FROM praises
    WHERE createdAt > '${d1}' AND createdAt <= '${d2}'
    GROUP BY DATE_TRUNC('day', createdAt)
    ORDER BY DATE_TRUNC('day', createdAt)
  ;`);
  return result.toArray().map((row) => row.toJSON());
};

const PraiseOverTime = ({
  date1,
  date2,
  date3,
}: {
  date1: string;
  date2: string;
  date3: string;
}): JSX.Element | null => {
  const dbContext = React.useContext(DuckDbContext);
  const [data, setData] = React.useState<GraphData | null>(null);
  const theme = useRecoilValue(Theme);

  /**
   * Load data from DuckDB.
   */
  React.useEffect(() => {
    if (!dbContext?.db || !dbContext?.tablesLoaded) return;
    const run = async (): Promise<void> => {
      if (!dbContext?.db) return;

      // Connect to database
      const conn = await dbContext.db.connect();

      const graphData: GraphData = {
        count: await countQuery(conn, date2, date3),
        countPrevious: await countQuery(conn, date1, date2),
        data: await praiseQuery(conn, date2, date3),
        dataPrevious: await praiseQuery(conn, date1, date2),
      };

      setData(graphData);
    };
    void run();
  }, [dbContext, date2, date1, date3]);

  if (!data || data.count === 0) return <Graph.LoadPlaceholder />;

  const firstDate = new Date(data.data[0].createdAt);

  const addDaysAndFormat = (date: Date, days: number): string =>
    format(addDays(date, days), 'dd MMM');

  ChartJS.register({
    id: 'beforeDraw',
    beforeDraw: (chart) => {
      if (chart.tooltip?.dataPoints && chart.tooltip?.dataPoints.length > 0) {
        const activePoint = chart.tooltip.dataPoints[0].element;
        const ctx = chart.ctx;
        const topY = chart.scales['y'].top;
        const bottomY = chart.scales['y'].bottom;

        // Draw vertical line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(activePoint.x, topY);
        ctx.lineTo(activePoint.x, bottomY);
        ctx.lineWidth = 1;
        ctx.strokeStyle =
          theme === 'Dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.5)';
        ctx.stroke();
        ctx.restore();
      }
    },
  });

  return (
    <Graph.Frame>
      <Graph.Header>Total Praise</Graph.Header>
      <Graph.HeaderNumber value={data.count} />
      <Graph.LargeValueChangePill
        value1={data.count}
        value2={data.countPrevious}
      />
      <Graph.SubHeader>Praise over time</Graph.SubHeader>
      <div className="relative w-full">
        <Line
          data={{
            labels: data.data.map((d) => d.ordinal),
            datasets: [
              {
                data: data.data.map((d) => d.count),
                borderWidth: 3,
                borderColor: '#E1007F',
                label: 'Period',
                pointRadius: 0,
                pointHoverRadius: 5,
                pointBackgroundColor: '#E1007F',
              },
              {
                data: data.dataPrevious.map((d) => d.count),
                borderWidth: 1,
                label: 'Previous',
                borderDash: [5, 5],
                pointRadius: 0,
                pointHoverRadius: 3,
                borderColor:
                  theme === 'Dark'
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(0,0,0,0.5)',
                pointBackgroundColor:
                  theme === 'Dark'
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(0,0,0,0.5)',
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                  title: (context): string =>
                    addDaysAndFormat(firstDate, context[0].dataIndex),
                  label: (context): string => {
                    return `${context.dataset.label}: ${context.parsed.y}`;
                  },
                },
              },
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                type: 'linear',
                position: 'bottom',
                border: {
                  color:
                    theme === 'Dark'
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.2)',
                },
                grid: {
                  display: false,
                },
                ticks: {
                  callback: (value): string =>
                    addDaysAndFormat(firstDate, value as number),
                  color:
                    theme === 'Dark'
                      ? 'rgba(255,255,255,0.5)'
                      : 'rgba(0,0,0,0.5)',
                },
              },
              y: {
                beginAtZero: true,
                border: {
                  color:
                    theme === 'Dark'
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.2)',
                },
                grid: {
                  color:
                    theme === 'Dark'
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.2)',
                },
                ticks: {
                  color:
                    theme === 'Dark'
                      ? 'rgba(255,255,255,0.5)'
                      : 'rgba(0,0,0,0.5)',
                },
              },
            },

            hover: {
              mode: 'index',
              intersect: false,
            },
            animation: {
              duration: 0,
            },
          }}
        />
      </div>
    </Graph.Frame>
  );
};

export default PraiseOverTime;
