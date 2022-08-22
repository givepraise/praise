import React, { Suspense } from 'react';

import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { PeriodStatusType } from 'api/dist/period/types';
import { LoadPlaceholder } from '@/components/analytics/LoadPlaceholder';
import { PeriodPageParams, SinglePeriod } from '@/model/periods';
import { Top10Praise } from './analytics/Top10Praise';
import { ReceiversByScore } from './analytics/ReceiversByScore';
import { PeriodStats } from './analytics/PeriodStats';
import { QuantifierScoringDistribution } from './analytics/QuantifierScoringDistribution';
import { QuantificationSpread } from './analytics/QuantificationSpread';
import { ReceiversByNumber } from './analytics/ReceiversByNumber';
import { GiversByScore } from './analytics/GiversByScore';
import { GiversByNumber } from './analytics/GiversByNumber';
import { QuantifiersByScore } from './analytics/QuantifiersByScore';
import { ScoreDistribution } from './analytics/ScoreDistribution';

const Analytics = (): JSX.Element => {
  const { periodId } = useParams<PeriodPageParams>();
  const period = useRecoilValue(SinglePeriod(periodId));
  if (!period || period.status !== PeriodStatusType.CLOSED) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        Analytics are available after quantification when the period is closed.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 px-5">
      <h2>Period metrics</h2>
      <Suspense fallback={<LoadPlaceholder height={100} />}>
        <PeriodStats />
      </Suspense>
      <h2>Top 10 praise</h2>
      <p>
        Which were the ten most significant contributions this period (according
        to the praise score)?
      </p>
      <Suspense fallback={<LoadPlaceholder height={1400} />}>
        <Top10Praise />
      </Suspense>
      <h2>Receivers by score</h2>
      <p>Which users received the highest total praise score?</p>
      <Suspense fallback={<LoadPlaceholder height={375} />}>
        <ReceiversByScore />
      </Suspense>
      <h2>Receivers by number</h2>
      <p>Which users received the most praise?</p>
      <Suspense fallback={<LoadPlaceholder height={375} />}>
        <ReceiversByNumber />
      </Suspense>
      <h2>Givers by score</h2>
      <p>
        Which givers praised contributions that led to the highest praise
        scores?
      </p>
      <Suspense fallback={<LoadPlaceholder height={375} />}>
        <GiversByScore />
      </Suspense>
      <h2>Top givers by number</h2>
      <p>Which users gave the most praise?</p>
      <Suspense fallback={<LoadPlaceholder height={375} />}>
        <GiversByNumber />
      </Suspense>
      <h2>Quantification score distribution</h2>
      <p>How often does each score of the scale get used by quantifiers?</p>
      <Suspense fallback={<LoadPlaceholder height={375} />}>
        <ScoreDistribution />
      </Suspense>
      <p className="text-xs">
        <b>*</b> This metric disregards scores of praise marked as a duplicate,
        since the score of the original is already being taken into account.
      </p>
      <h2>Quantifiers by score</h2>
      <p>
        Which quantifier gave the highest quantification scores? If all
        quantifiers where assigned the equal amount of praise and all
        quantifiers on average gave similar quantification scores the boxes
        would all be the same size.
      </p>
      <Suspense fallback={<LoadPlaceholder height={375} />}>
        <QuantifiersByScore />
      </Suspense>
      <p className="text-xs">
        <b>*</b> The visualisation does not take into account that some
        quantifiers get assigned less praise than others.
      </p>
      <h2>Quantifier scoring distribution</h2>
      <p>
        On average, does the quantifiers score praise similarly? Are some
        quantifiers more generous than others?
      </p>
      <Suspense fallback={<LoadPlaceholder height={375} />}>
        <QuantifierScoringDistribution />
      </Suspense>
      <h2>Quantification spread</h2>
      <p>
        When does the quantifiers agree or disagree? High quantification spread
        means disagreement between quantifiers as to the importance of a
        contribution.
      </p>
      <Suspense fallback={<LoadPlaceholder height={375} />}>
        <QuantificationSpread />
      </Suspense>
      <p className="text-xs">
        <b>*</b>The spread is measured by the difference between the highest and
        lowest score given to a praise.
      </p>
    </div>
  );
};

// eslint-disable-next-line import/no-default-export
export default Analytics;
