import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
  XYPlot,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  VerticalBarSeries,
  VerticalBarSeriesPoint,
  Hint,
} from 'react-vis';
import { PeriodPageParams } from '@/model/periods';
import { PeriodQuantScoreDistribution } from '@/model/periodAnalytics';

export const ScoreDistribution = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const scoreDistribution = useRecoilValue(
    PeriodQuantScoreDistribution(periodId)
  );
  const [hoveredNode, setHoveredNode] =
    React.useState<VerticalBarSeriesPoint | null>(null);

  const data: VerticalBarSeriesPoint[] = [];
  scoreDistribution?.forEach((value, key) => {
    data.push({ x: key, y: value });
  });

  return (
    <div>
      <XYPlot
        height={300}
        width={670}
        onMouseLeave={(): void => setHoveredNode(null)}
        color="#E1007F"
      >
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis />
        <YAxis />
        <VerticalBarSeries
          data={data}
          barWidth={1}
          onNearestXY={(dataPoint): void => {
            setHoveredNode(dataPoint);
          }}
        />
        {hoveredNode && (
          <Hint
            value={hoveredNode}
            align={{ vertical: 'top', horizontal: 'left' }}
          >
            <div className="p-3 text-xs text-gray-900 border border-solid rounded-lg shadow-md dark:text-white bg-warm-gray-50 dark:bg-slate-900 overflow-clip text-ellipsis">
              {hoveredNode.y}
            </div>
          </Hint>
        )}
      </XYPlot>
    </div>
  );
};
