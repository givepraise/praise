import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { Treemap, TreemapPoint } from 'react-vis';
import {
  PeriodPageParams,
  SinglePeriod,
  useLoadSinglePeriodDetails,
} from '@/model/periods';
import { TreemapHint } from '@/components/analytics/TreemapHint';
import { ErrorPlaceholder } from '@/components/analytics/ErrorPlaceholder';

export const TopGiversByScore = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  useLoadSinglePeriodDetails(periodId);
  const period = useRecoilValue(SinglePeriod(periodId));

  const [hoveredLeaf, setHoveredLeaf] = React.useState<TreemapPoint | null>(
    null
  );

  if (!period || !period.givers) {
    return <ErrorPlaceholder height={600} />;
  }

  const sortGiversByScore = [...period.givers].sort(
    (a, b) => b.scoreRealized - a.scoreRealized
  );

  const data = {
    title: 'analytics',
    children: period.givers.map((giver) => {
      return {
        title: giver.userAccount?.nameRealized || '',
        size: giver.scoreRealized,
        opacity:
          hoveredLeaf &&
          hoveredLeaf.data.title === giver.userAccount?.nameRealized
            ? (giver.praiseCount / sortGiversByScore[0].praiseCount) * 1.0
            : (giver.praiseCount / sortGiversByScore[0].praiseCount) * 1.0 +
              0.1,
      };
    }),
  };

  return (
    <div>
      {hoveredLeaf && <TreemapHint treemapPoint={hoveredLeaf} />}
      <Treemap
        width={710}
        height={600}
        data={data}
        mode="binary"
        padding={3}
        hideRootNode={true}
        animation
        onLeafMouseOver={(data): void => setHoveredLeaf(data)}
        onLeafMouseOut={(): void => setHoveredLeaf(null)}
        color="#E1007F"
      />
    </div>
  );
};
