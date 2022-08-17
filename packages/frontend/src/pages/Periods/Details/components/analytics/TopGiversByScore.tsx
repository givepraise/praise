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

  const length = period.givers.length;
  const data = {
    title: 'analytics',
    children: period.givers.map((receiver, index) => {
      return {
        title: receiver.userAccount?.nameRealized || '',
        size: receiver.scoreRealized,
        opacity: ((length - index) / length) * 1.0,
      };
    }),
  };

  return (
    <div>
      {hoveredLeaf && <TreemapHint treemapPoint={hoveredLeaf} />}
      <Treemap
        title={'My New Treemap'}
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
