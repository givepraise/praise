import 'react-vis/dist/style.css';

import React, { Suspense } from 'react';

import { LoadPlaceholder } from '@/components/analytics/LoadPlaceholder';
import { Top10Praise } from './analytics/Top10Praise';

import { TopReceiversByNumber } from './analytics/TopReceiversByNumber';
import { TopReceiversByScore } from './analytics/TopReceiversByScore';
import { TopGiversByScore } from './analytics/TopGiversByScore';
import { TopGiversByNumber } from './analytics/TopGiversByNumber';
import { PeriodStats } from './analytics/PeriodStats';

const Analytics = (): JSX.Element => {
  return (
    <div className="flex flex-col gap-2 px-5">
      <h2>Period metrics</h2>
      <Suspense fallback={<LoadPlaceholder height={80} />}>
        <PeriodStats />
      </Suspense>

      <h2>Top 10 praise</h2>
      <span>The ten most highly scored praise this period.</span>
      <Suspense fallback={<LoadPlaceholder height={800} />}>
        <Top10Praise />
      </Suspense>

      <h2>Top receivers (by score)</h2>
      <Suspense fallback={<LoadPlaceholder height={600} />}>
        <TopReceiversByScore />
      </Suspense>

      <h2>Top receivers (by number)</h2>
      <Suspense fallback={<LoadPlaceholder height={600} />}>
        <TopReceiversByNumber />
      </Suspense>

      <h2>Top givers (by score)</h2>
      <Suspense fallback={<LoadPlaceholder height={600} />}>
        <TopGiversByScore />
      </Suspense>

      <h2>Top givers (by number)</h2>
      <Suspense fallback={<LoadPlaceholder height={600} />}>
        <TopGiversByNumber />
      </Suspense>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default Analytics;
