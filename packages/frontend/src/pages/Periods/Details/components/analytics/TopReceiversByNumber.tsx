import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { Treemap, TreemapPoint } from 'react-vis';
import {
  PeriodPageParams,
  SinglePeriod,
  useLoadSinglePeriodDetails,
} from '@/model/periods';
import { TreemapHint } from '@/components/analytics/TreemapHint';
import { ErrorPlaceholder } from '@/components/analytics/ErrorPlaceholder';

export const TopReceiversByNumber = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  useLoadSinglePeriodDetails(periodId);
  const period = useRecoilValue(SinglePeriod(periodId));
  const history = useHistory();

  const [hoveredLeaf, setHoveredLeaf] = React.useState<TreemapPoint | null>(
    null
  );

  if (!period || !period.receivers) {
    return <ErrorPlaceholder height={600} />;
  }

  const sortReceiversByCount = [...period.receivers].sort(
    (a, b) => b.praiseCount - a.praiseCount
  );
  const data = {
    title: 'analytics',
    children: period.receivers.map((receiver) => {
      return {
        _id: receiver._id,
        title: receiver.userAccount?.nameRealized || '',
        size: receiver.praiseCount,
        opacity:
          hoveredLeaf &&
          hoveredLeaf.data.title === receiver.userAccount?.nameRealized
            ? (receiver.praiseCount / sortReceiversByCount[0].praiseCount) * 1.0
            : (receiver.praiseCount / sortReceiversByCount[0].praiseCount) *
                1.0 +
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
        onLeafClick={(leaf): void => {
          history.push(`/periods/${periodId}/receiver/${leaf.data._id}`);
        }}
        color="#E1007F"
      />
    </div>
  );
};
