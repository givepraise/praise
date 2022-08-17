import React, { Suspense } from 'react';

import { LoadPlaceholder } from '@/components/analytics/LoadPlaceholder';
import { Top10Praise } from './analytics/Top10Praise';
import { TopReceiversByScore } from './analytics/TopReceiversByScore';

import 'react-vis/dist/style.css';
import { TopReceiversByNumber } from './analytics/TopReceiversByNumber';

const Analytics = (): JSX.Element => {
  return (
    <div className="flex flex-col gap-2 px-5">
      <span className="text-xl font-bold">Top 10 praise</span>
      <span>The ten most highly scored praise this period.</span>
      <Suspense fallback={<LoadPlaceholder height={800} />}>
        <Top10Praise />
      </Suspense>

      <span className="text-xl font-bold">Top receivers (by score)</span>
      <Suspense fallback={<LoadPlaceholder height={600} />}>
        <TopReceiversByScore />
      </Suspense>

      <span className="text-xl font-bold">Top receivers (by number)</span>
      <Suspense fallback={<LoadPlaceholder height={600} />}>
        <TopReceiversByNumber />
      </Suspense>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default Analytics;
